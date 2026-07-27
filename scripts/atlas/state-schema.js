const fs = require('node:fs');
const path = require('node:path');

const SCORE_FIELDS = ['sovereign_score', 'revenue_velocity', 'retention_health', 'cash_discipline'];
const HISTORY_FIELDS = ['sovereign_scores', 'revenue_velocity', 'retention_health', 'cash_discipline', 'timestamps'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function add(errors, pathName, message) {
  errors.push(`${pathName}: ${message}`);
}

function validateScore(value, pathName, errors) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    add(errors, pathName, 'must be a finite number');
    return;
  }
  if (value < 0 || value > 100) {
    add(errors, pathName, 'must be between 0 and 100');
  }
}

function validateContextState(data) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(data)) {
    return { ok: false, errors: ['root: must be an object'], warnings };
  }

  if (!isPlainObject(data.project)) {
    add(errors, 'project', 'must be an object');
  } else {
    if (typeof data.project.name !== 'string' || !data.project.name.trim()) {
      add(errors, 'project.name', 'must be a non-empty string');
    }
    if (typeof data.project.slug !== 'string' || !SLUG_PATTERN.test(data.project.slug)) {
      add(errors, 'project.slug', 'must be a lowercase slug');
    }
  }

  if (!isPlainObject(data.scores)) {
    add(errors, 'scores', 'must be an object');
  } else {
    for (const field of SCORE_FIELDS) {
      validateScore(data.scores[field], `scores.${field}`, errors);
    }
    if (data.scores.last_updated !== undefined && typeof data.scores.last_updated !== 'string') {
      add(errors, 'scores.last_updated', 'must be an ISO timestamp string when present');
    }
  }

  if (!isPlainObject(data.context)) {
    add(errors, 'context', 'must be an object');
  } else {
    if (typeof data.context.current_phase !== 'number' || !Number.isFinite(data.context.current_phase) || data.context.current_phase < 0) {
      add(errors, 'context.current_phase', 'must be a non-negative number');
    }
    if (typeof data.context.mode !== 'string' || !data.context.mode.trim()) {
      add(errors, 'context.mode', 'must be a non-empty string');
    }
    if (!data.context.last_activity) {
      warnings.push('context.last_activity: recommended for resume fidelity');
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

function validateScoreHistory(data) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(data)) {
    return { ok: false, errors: ['root: must be an object'], warnings };
  }

  for (const field of HISTORY_FIELDS) {
    if (!Array.isArray(data[field])) {
      add(errors, field, 'must be an array');
    }
  }

  if (errors.length === 0) {
    const lengths = HISTORY_FIELDS.map((field) => data[field].length);
    const uniqueLengths = new Set(lengths);
    if (uniqueLengths.size !== 1) {
      add(errors, 'history', `arrays must have matching lengths (${HISTORY_FIELDS.map((field) => `${field}=${data[field].length}`).join(', ')})`);
    }

    for (const field of SCORE_FIELDS) {
      const historyField = field === 'sovereign_score' ? 'sovereign_scores' : field;
      data[historyField].forEach((value, index) => validateScore(value, `${historyField}[${index}]`, errors));
    }

    data.timestamps.forEach((value, index) => {
      if (typeof value !== 'string' || !value.trim()) {
        add(errors, `timestamps[${index}]`, 'must be a non-empty string');
      }
    });
  }

  if (errors.length === 0 && data.timestamps.length === 0) {
    warnings.push('history: empty until the first score capture');
  }

  return { ok: errors.length === 0, errors, warnings };
}

function readJson(filePath) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function validateProjectState(projectDir) {
  const results = [];
  const contextPath = path.join(projectDir, 'context.json');
  const scoreHistoryPath = path.join(projectDir, 'score_history.json');

  if (!fs.existsSync(contextPath)) {
    results.push({ file: 'context.json', ok: false, errors: ['file: missing'], warnings: [] });
  } else {
    const context = readJson(contextPath);
    results.push({
      file: 'context.json',
      ...(context.ok ? validateContextState(context.value) : { ok: false, errors: [`json: ${context.error}`], warnings: [] }),
    });
  }

  if (!fs.existsSync(scoreHistoryPath)) {
    results.push({ file: 'score_history.json', ok: false, errors: ['file: missing'], warnings: [] });
  } else {
    const history = readJson(scoreHistoryPath);
    results.push({
      file: 'score_history.json',
      ...(history.ok ? validateScoreHistory(history.value) : { ok: false, errors: [`json: ${history.error}`], warnings: [] }),
    });
  }

  return {
    ok: results.every((result) => result.ok),
    results,
  };
}

module.exports = {
  SCORE_FIELDS,
  HISTORY_FIELDS,
  validateContextState,
  validateProjectState,
  validateScoreHistory,
};
