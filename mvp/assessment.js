/*
 * Home-accessibility needs assessment -- real rule-based scoring, not a
 * hardcoded checklist. Answers drive which items appear and at what
 * priority. The "connect to vetted local contractors" half of the spec
 * is honestly a lead-capture form here, not a real vetted-contractor
 * directory (none exists yet) -- flagged as such in the UI, not implied.
 */

const RULES = [
  {
    id: 'grab_bars_bath',
    condition: (a) => a.bathroomHazard === true,
    priority: 'high',
    text: 'Install grab bars at the toilet and inside the shower/tub -- bathroom falls are the most common home injury for this population.'
  },
  {
    id: 'walk_in_shower',
    condition: (a) => a.bathroomHazard === true && a.mobilityAid !== 'none',
    priority: 'high',
    text: 'Convert to a curbless/walk-in shower -- a step-over tub lip is a high fall-risk with a walker, cane, or wheelchair.'
  },
  {
    id: 'stair_lift',
    condition: (a) => a.hasStairsToMainLiving && a.mobilityAid !== 'none',
    priority: 'high',
    text: 'Evaluate a stair lift or ramp for the stairs to the main living area -- currently the primary route depends on stairs while using a mobility aid.'
  },
  {
    id: 'stair_handrail',
    condition: (a) => a.hasStairsToMainLiving && !a.hasHandrailBothSides,
    priority: 'medium',
    text: 'Add a second handrail so stairs have support on both sides.'
  },
  {
    id: 'entry_ramp',
    condition: (a) => a.hasStepAtEntry && a.mobilityAid === 'wheelchair',
    priority: 'high',
    text: 'Install a permanent entry ramp -- a step at the main entrance blocks wheelchair access entirely.'
  },
  {
    id: 'entry_threshold',
    condition: (a) => a.hasStepAtEntry && a.mobilityAid !== 'wheelchair' && a.mobilityAid !== 'none',
    priority: 'medium',
    text: 'Add a low-rise threshold ramp at the entry step.'
  },
  {
    id: 'lever_handles',
    condition: (a) => a.hasArthritisOrGripIssue === true,
    priority: 'medium',
    text: 'Replace round doorknobs and faucet knobs with lever-style handles -- easier to operate with limited grip strength.'
  },
  {
    id: 'lighting_upgrade',
    condition: (a) => a.hallwaysDimlyLit === true,
    priority: 'medium',
    text: 'Add brighter, motion-activated lighting in hallways and stairwells -- reduces fall risk from low visibility, especially at night.'
  },
  {
    id: 'medical_alert',
    condition: (a) => a.livesAlone === true && a.fallHistory === true,
    priority: 'high',
    text: 'Consider a wearable medical-alert system -- lives alone with a prior fall, and unattended falls are the highest-severity risk in this profile.'
  },
  {
    id: 'raised_toilet',
    condition: (a) => a.hasArthritisOrGripIssue === true || a.mobilityAid !== 'none',
    priority: 'low',
    text: 'Add a raised toilet seat or comfort-height toilet -- reduces strain on knees/hips when sitting or standing.'
  },
  {
    id: 'kitchen_reach',
    condition: (a) => a.mobilityAid === 'wheelchair',
    priority: 'medium',
    text: 'Lower frequently-used kitchen storage and countertop sections to wheelchair-accessible height.'
  }
];

function assessAccessibilityNeeds(answers) {
  const required = ['hasStairsToMainLiving', 'hasStepAtEntry', 'bathroomHazard', 'mobilityAid'];
  for (const f of required) {
    if (!(f in answers)) throw new Error(`Missing required answer: ${f}`);
  }

  const matched = RULES.filter(r => r.condition(answers));
  const order = { high: 0, medium: 1, low: 2 };
  matched.sort((a, b) => order[a.priority] - order[b.priority]);

  const counts = { high: 0, medium: 0, low: 0 };
  matched.forEach(m => counts[m.priority]++);

  let urgency;
  if (counts.high >= 2) urgency = 'urgent';
  else if (counts.high === 1) urgency = 'elevated';
  else if (counts.medium > 0) urgency = 'moderate';
  else urgency = 'low';

  return {
    urgency,
    counts,
    checklist: matched.map(m => ({ id: m.id, priority: m.priority, recommendation: m.text })),
    itemCount: matched.length
  };
}

if (typeof module !== 'undefined') {
  module.exports = { assessAccessibilityNeeds, RULES };
}
