import { Scheme } from '../models/Scheme.js';

export const getSchemes = async (req, res, next) => {
  try {
    const schemes = await Scheme.findAll();
    res.json({ success: true, data: schemes, count: schemes.length });
  } catch (err) {
    next(err);
  }
};

export const getSchemeByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const scheme = await Scheme.findByCode(code);
    if (!scheme) {
      return res.status(404).json({ success: false, message: `Scheme with code ${code} not found.` });
    }
    res.json({ success: true, data: scheme });
  } catch (err) {
    next(err);
  }
};

export const createScheme = async (req, res, next) => {
  try {
    const { schemeCode, schemeName } = req.body;
    if (!schemeCode || !schemeName) {
      return res.status(400).json({
        success: false,
        message: 'schemeCode and schemeName are mandatory.'
      });
    }

    const scheme = await Scheme.create(req.body);
    res.status(201).json({
      success: true,
      message: `Scheme ${scheme.schemeCode} created successfully.`,
      data: scheme
    });
  } catch (err) {
    next(err);
  }
};

export const updateScheme = async (req, res, next) => {
  try {
    const { code } = req.params;
    const updated = await Scheme.update(code, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Scheme ${code} not found.` });
    }

    res.json({
      success: true,
      message: `Scheme ${code} configuration updated successfully.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
