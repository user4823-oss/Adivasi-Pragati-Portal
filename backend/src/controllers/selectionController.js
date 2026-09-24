import { Application } from '../models/Application.js';
import { Scheme } from '../models/Scheme.js';

export const getRankedSelection = async (req, res, next) => {
  try {
    const { schemeCode } = req.params;
    const cleanCode = (schemeCode || 'ARG45').trim().toUpperCase();

    const scheme = await Scheme.findByCode(cleanCode);
    if (!scheme) {
      return res.status(404).json({ success: false, message: `Scheme ${cleanCode} not found.` });
    }

    const allApps = await Application.findByScheme(cleanCode);

    // Eligible candidates for selection consideration (typically Under Review or non-finalized)
    // If none are strictly "Under Review", include Submitted as well for evaluation
    let candidatePool = allApps.filter((a) =>
      ['Under Review', 'Submitted', 'Deficiency Raised'].includes(a.status)
    );

    // If pool is empty because all are already Selected or Rejected, show all for demonstration
    if (candidatePool.length === 0) {
      candidatePool = allApps;
    }

    // 1. Raw Merit Ranking by marksPercentage descending
    candidatePool.sort((a, b) => {
      if (b.marksPercentage !== a.marksPercentage) {
        return b.marksPercentage - a.marksPercentage;
      }
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });

    const candidatesWithRawRank = candidatePool.map((c, idx) => ({
      ...c,
      rawRank: idx + 1
    }));

    let rankedList = [];

    if (cleanCode === 'AZKMI') {
      // --- NOS Scheme (AZKMI): Quota allocation: 17 General ST + 3 PVTG (Total 20 seats) ---
      const totalSeats = 20;
      const pvtgQuotaSeats = 3;
      const generalQuotaSeats = totalSeats - pvtgQuotaSeats; // 17

      const pvtgCandidates = candidatesWithRawRank.filter((c) => c.specialCategory === 'PVTG');
      const nonPvtgCandidates = candidatesWithRawRank.filter((c) => c.specialCategory !== 'PVTG');

      // Top up to 3 PVTG candidates allocated under earmarked quota
      const selectedPvtg = pvtgCandidates.slice(0, pvtgQuotaSeats);
      const remainingPvtg = pvtgCandidates.slice(pvtgQuotaSeats);

      // Remaining seats filled by highest merit among nonPvtg + any remaining PVTG by merit
      const meritContenders = [...nonPvtgCandidates, ...remainingPvtg].sort(
        (a, b) => b.marksPercentage - a.marksPercentage
      );

      const selectedGeneral = meritContenders.slice(0, generalQuotaSeats);
      const unselectedGeneral = meritContenders.slice(generalQuotaSeats);

      const allSelectedIds = new Set([
        ...selectedPvtg.map((c) => c.id),
        ...selectedGeneral.map((c) => c.id)
      ]);

      rankedList = candidatesWithRawRank.map((c) => {
        const isSelected = allSelectedIds.has(c.id);
        const isPvtg = c.specialCategory === 'PVTG';
        const inPvtgQuota = selectedPvtg.some((p) => p.id === c.id);

        // A PVTG candidate is quota-adjusted if their raw rank > generalQuotaSeats (17) or > totalSeats (20)
        // or if they were pulled up into selection via the 3 PVTG earmarked quota seats
        const isQuotaAdjusted = inPvtgQuota && c.rawRank > generalQuotaSeats;

        let quotaReason = null;
        if (isQuotaAdjusted) {
          quotaReason = `Quota-adjusted: Promoted into top selection via 3 earmarked PVTG quota seats (Raw Rank #${c.rawRank} with ${c.marksPercentage}%).`;
        } else if (inPvtgQuota) {
          quotaReason = `Selected under PVTG Quota (Merit Rank #${c.rawRank}).`;
        } else if (isSelected) {
          quotaReason = `Selected under General ST Merit Quota (Merit Rank #${c.rawRank}).`;
        } else {
          quotaReason = `Waitlisted / Cutoff exceeded beyond available seats.`;
        }

        return {
          ...c,
          proposedStatus: isSelected ? 'Selected' : 'Not Selected',
          isQuotaAdjusted,
          quotaCategory: isPvtg ? 'PVTG' : 'General ST',
          quotaReason,
          preferenceEligible: isPvtg,
          preferenceType: isPvtg ? 'PVTG' : null
        };
      });
    } else {
      // --- NFST Scheme (ARG45): Pure merit ranking with preference indicator ---
      // Real NFST rule: Pure merit on marks, with preference tags for PVTG / Divyangan
      const totalSeats = scheme.quotaRules?.[0]?.totalSeats || 750;
      const effectiveCutoff = Math.min(candidatePool.length, 5); // display threshold for prototype

      rankedList = candidatesWithRawRank.map((c, idx) => {
        const hasPreference = c.specialCategory === 'PVTG' || c.specialCategory === 'Divyangan';
        const isSelected = idx < effectiveCutoff;

        return {
          ...c,
          proposedStatus: isSelected ? 'Selected' : 'Not Selected',
          isQuotaAdjusted: false,
          quotaCategory: 'ST (Universal)',
          quotaReason: isSelected ? `Selected on Master's merit ranking (Rank #${c.rawRank}).` : 'Below merit cutoff.',
          preferenceEligible: hasPreference,
          preferenceType: hasPreference ? c.specialCategory : null,
          preferenceReason: hasPreference
            ? `Preference Eligible: ${c.specialCategory} candidate per scheme guidelines Clause 4.2.`
            : null
        };
      });
    }

    // Sort rankedList with Selected first, then by marks descending
    rankedList.sort((a, b) => {
      if (a.proposedStatus === 'Selected' && b.proposedStatus !== 'Selected') return -1;
      if (a.proposedStatus !== 'Selected' && b.proposedStatus === 'Selected') return 1;
      return b.marksPercentage - a.marksPercentage;
    });

    res.json({
      success: true,
      scheme: {
        schemeCode: scheme.schemeCode,
        schemeName: scheme.schemeName,
        selectionMethod: scheme.selectionMethod,
        quotaRules: scheme.quotaRules
      },
      totalCandidates: candidatePool.length,
      candidates: rankedList
    });
  } catch (err) {
    next(err);
  }
};

export const confirmSelection = async (req, res, next) => {
  try {
    const { schemeCode } = req.params;
    const { selections, committeeRemarks } = req.body;

    if (!Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'selections array is required with at least one candidate decision.'
      });
    }

    const updated = [];

    for (const item of selections) {
      const { id, status, overrideReason, overriddenBy } = item;
      const targetStatus = status === 'Selected' ? 'Selected' : 'Not Selected';

      const remark = overrideReason
        ? `Committee Override: ${overrideReason}`
        : committeeRemarks || `Confirmed via Quota Merit Selection Engine under Scheme ${schemeCode}.`;

      const app = await Application.updateStatus(
        id,
        targetStatus,
        remark,
        null,
        null,
        overriddenBy || 'Selection Committee',
        overrideReason || null
      );

      if (app) {
        updated.push({
          id: app.id,
          name: app.name,
          status: app.status,
          overrideReason: app.overrideReason,
          overriddenBy: app.overriddenBy
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully confirmed selection decisions for ${updated.length} applicant(s).`,
      count: updated.length,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
