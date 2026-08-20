// GENERATED FILE — 0.48 D3
// Source: validated authoritative VR relation authority pinned to f4534b4f92d88f3950ec0c9c211bfa4648cd08ea.
// Do not hand-edit Tarot doctrine here; regenerate from the pinned authority producer.

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const AUTHORITATIVE_RELATION_AUTHORITY_META = deepFreeze({
  "authorityCommit": "f4534b4f92d88f3950ec0c9c211bfa4648cd08ea",
  "authorityRepository": "bookthief666/tarot-archetype-vr",
  "centerRuleCount": 25,
  "contractId": "grimoire.tarot.semantic.v1",
  "contractVersion": "1.0.0",
  "kernelVersion": "0.1.0",
  "pairFactCount": 50,
  "schemaId": "grimoire.tarot.relation-authority.d3",
  "schemaVersion": "1.0.0",
  "sourcePackSourceId": "src.primary.crowley.liber-lxxviii",
  "sourcePackVersion": "0.1.0"
});

export const AUTHORITATIVE_RELATION_AUTHORITY = deepFreeze({
  "centerRules": {
    "coins>coins": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "coins>cups": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "SOURCE_DOES_NOT_SPECIFY_PAIR",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "coins>major": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "coins>staffs": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "coins>swords": {
      "applied": true,
      "claimIds": [
        "claim.l78.dignity.inimical.swords-coins",
        "claim.l78.dignity.center-between-contraries"
      ],
      "effect": "CENTER_NOT_MUCH_AFFECTED_BY_EITHER_NEIGHBOR",
      "effectType": "CENTER_BETWEEN_CONTRARIES",
      "reasonCode": null,
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "SUPPORTED"
    },
    "cups>coins": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "SOURCE_DOES_NOT_SPECIFY_PAIR",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "cups>cups": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "cups>major": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "cups>staffs": {
      "applied": true,
      "claimIds": [
        "claim.l78.dignity.inimical.staffs-cups",
        "claim.l78.dignity.center-between-contraries"
      ],
      "effect": "CENTER_NOT_MUCH_AFFECTED_BY_EITHER_NEIGHBOR",
      "effectType": "CENTER_BETWEEN_CONTRARIES",
      "reasonCode": null,
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "SUPPORTED"
    },
    "cups>swords": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "major>coins": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "major>cups": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "major>major": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "major>staffs": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "major>swords": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "staffs>coins": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "staffs>cups": {
      "applied": true,
      "claimIds": [
        "claim.l78.dignity.inimical.staffs-cups",
        "claim.l78.dignity.center-between-contraries"
      ],
      "effect": "CENTER_NOT_MUCH_AFFECTED_BY_EITHER_NEIGHBOR",
      "effectType": "CENTER_BETWEEN_CONTRARIES",
      "reasonCode": null,
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "SUPPORTED"
    },
    "staffs>major": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "staffs>staffs": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "staffs>swords": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "swords>coins": {
      "applied": true,
      "claimIds": [
        "claim.l78.dignity.inimical.swords-coins",
        "claim.l78.dignity.center-between-contraries"
      ],
      "effect": "CENTER_NOT_MUCH_AFFECTED_BY_EITHER_NEIGHBOR",
      "effectType": "CENTER_BETWEEN_CONTRARIES",
      "reasonCode": null,
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "SUPPORTED"
    },
    "swords>cups": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "swords>major": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "sourceIds": [],
      "status": "UNSPECIFIED"
    },
    "swords>staffs": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    },
    "swords>swords": {
      "applied": false,
      "claimIds": [],
      "effect": null,
      "effectType": null,
      "reasonCode": "OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "status": "UNSPECIFIED"
    }
  },
  "pairFacts": {
    "IMMEDIATE_NEIGHBOR:coins>coins": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:coins>cups": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "SOURCE_DOES_NOT_SPECIFY_PAIR",
      "relationType": "UNSPECIFIED",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:coins>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:coins>staffs": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.friendly.staffs-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:coins>swords": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.inimical.swords-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:cups>coins": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "SOURCE_DOES_NOT_SPECIFY_PAIR",
      "relationType": "UNSPECIFIED",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:cups>cups": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:cups>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:cups>staffs": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.inimical.staffs-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:cups>swords": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.friendly.swords-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:major>coins": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:major>cups": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:major>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:major>staffs": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:major>swords": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:staffs>coins": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.friendly.staffs-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:staffs>cups": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.inimical.staffs-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:staffs>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:staffs>staffs": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:staffs>swords": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.friendly.swords-staffs"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:swords>coins": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.inimical.swords-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:swords>cups": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.friendly.swords-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:swords>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "IMMEDIATE_NEIGHBOR:swords>staffs": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.friendly.swords-staffs"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "IMMEDIATE_NEIGHBOR:swords>swords": {
      "claimIds": [
        "claim.l78.dignity.adjacency",
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:coins>coins": {
      "claimIds": [
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:coins>cups": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "SOURCE_DOES_NOT_SPECIFY_PAIR",
      "relationType": "UNSPECIFIED",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:coins>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:coins>staffs": {
      "claimIds": [
        "claim.l78.dignity.friendly.staffs-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:coins>swords": {
      "claimIds": [
        "claim.l78.dignity.inimical.swords-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:cups>coins": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "SOURCE_DOES_NOT_SPECIFY_PAIR",
      "relationType": "UNSPECIFIED",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:cups>cups": {
      "claimIds": [
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:cups>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:cups>staffs": {
      "claimIds": [
        "claim.l78.dignity.inimical.staffs-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:cups>swords": {
      "claimIds": [
        "claim.l78.dignity.friendly.swords-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:major>coins": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:major>cups": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:major>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:major>staffs": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:major>swords": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:staffs>coins": {
      "claimIds": [
        "claim.l78.dignity.friendly.staffs-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:staffs>cups": {
      "claimIds": [
        "claim.l78.dignity.inimical.staffs-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:staffs>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:staffs>staffs": {
      "claimIds": [
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:staffs>swords": {
      "claimIds": [
        "claim.l78.dignity.friendly.swords-staffs"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:swords>coins": {
      "claimIds": [
        "claim.l78.dignity.inimical.swords-coins"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "INIMICAL",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:swords>cups": {
      "claimIds": [
        "claim.l78.dignity.friendly.swords-cups"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:swords>major": {
      "claimIds": [],
      "kernelVersion": "0.1.0",
      "reasonCode": "CARD_WITHOUT_SUIT_FAMILY",
      "relationType": "UNSPECIFIED",
      "sourceIds": [],
      "sourcePackVersion": "0.1.0",
      "status": "UNSPECIFIED"
    },
    "OUTER_PAIR_CONTEXT:swords>staffs": {
      "claimIds": [
        "claim.l78.dignity.friendly.swords-staffs"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "FRIENDLY",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    },
    "OUTER_PAIR_CONTEXT:swords>swords": {
      "claimIds": [
        "claim.l78.dignity.same-suit-strengthens"
      ],
      "kernelVersion": "0.1.0",
      "reasonCode": null,
      "relationType": "SAME_SUIT_STRONG",
      "sourceIds": [
        "src.primary.crowley.liber-lxxviii"
      ],
      "sourcePackVersion": "0.1.0",
      "status": "SUPPORTED"
    }
  },
  "relationMethod": {
    "compatibleTarotSystems": [
      "rws",
      "thoth"
    ],
    "doctrineSourceIds": [
      "src.primary.crowley.liber-lxxviii"
    ],
    "methodId": "crowley_lxxviii_dignities",
    "selection": {
      "marseille": {
        "authority": null,
        "claimIds": [],
        "sourceIds": [],
        "supported": false
      },
      "rws": {
        "authority": "DIRECT_METHOD_SELECTION",
        "claimIds": [],
        "sourceIds": [
          "src.primary.crowley.liber-lxxviii"
        ],
        "supported": true
      },
      "thoth": {
        "authority": "SOURCE_QUALIFIED_METHOD_INHERITANCE",
        "claimIds": [
          "claim.thoth1944.divination.method-source.equinox-i-8"
        ],
        "sourceIds": [
          "src.primary.crowley.book-of-thoth.1944",
          "src.primary.crowley.liber-lxxviii"
        ],
        "supported": true
      }
    },
    "semanticStatus": "CANONICAL"
  }
});
