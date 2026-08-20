// GENERATED FILE — DO NOT HAND EDIT.
// Source: bookthief666/tarot-archetype-vr@f4534b4f92d88f3950ec0c9c211bfa4648cd08ea

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const AUTHORITATIVE_SPREAD_MANIFEST_META = deepFreeze({
  "contractId": "grimoire.tarot.semantic.v1",
  "contractVersion": "1.0.0",
  "authorityRepository": "bookthief666/tarot-archetype-vr",
  "authorityCommit": "f4534b4f92d88f3950ec0c9c211bfa4648cd08ea",
  "spreadKeys": [
    "TRIAD",
    "HEXAGRAM",
    "CROSS"
  ],
  "generatedFrom": "0.48 validated VR conformance parity core"
});

export const AUTHORITATIVE_SPREAD_MANIFEST = deepFreeze({
  "TRIAD": {
    "cardCount": 3,
    "positions": [
      {
        "label": "THESIS",
        "ordinal": 0,
        "positionId": "thesis",
        "questionFunction": "the first articulated force or proposition in the question"
      },
      {
        "label": "ANTITHESIS",
        "ordinal": 1,
        "positionId": "antithesis",
        "questionFunction": "the force that resists, complicates, or qualifies the first"
      },
      {
        "label": "SYNTHESIS",
        "ordinal": 2,
        "positionId": "synthesis",
        "questionFunction": "what becomes visible when the first two are read in relation"
      }
    ],
    "semanticStatus": "CANONICAL_PROJECT",
    "spreadId": "grimoire.triad.dialectic",
    "topology": {
      "orderedAdjacency": [
        [
          "thesis",
          "antithesis"
        ],
        [
          "antithesis",
          "synthesis"
        ]
      ],
      "visualEdges": [
        [
          "thesis",
          "antithesis"
        ],
        [
          "thesis",
          "synthesis"
        ],
        [
          "antithesis",
          "synthesis"
        ]
      ]
    },
    "version": "1.0.0"
  },
  "HEXAGRAM": {
    "cardCount": 6,
    "positions": [
      {
        "label": "POSITION 1",
        "ordinal": 0,
        "positionId": "p1",
        "questionFunction": null
      },
      {
        "label": "POSITION 2",
        "ordinal": 1,
        "positionId": "p2",
        "questionFunction": null
      },
      {
        "label": "POSITION 3",
        "ordinal": 2,
        "positionId": "p3",
        "questionFunction": null
      },
      {
        "label": "POSITION 4",
        "ordinal": 3,
        "positionId": "p4",
        "questionFunction": null
      },
      {
        "label": "POSITION 5",
        "ordinal": 4,
        "positionId": "p5",
        "questionFunction": null
      },
      {
        "label": "POSITION 6",
        "ordinal": 5,
        "positionId": "p6",
        "questionFunction": null
      }
    ],
    "semanticStatus": "PROVISIONAL",
    "spreadId": "legacy.hexagram.v031",
    "topology": {
      "orderedAdjacency": [],
      "visualEdges": []
    },
    "version": "0.31.0"
  },
  "CROSS": {
    "cardCount": 10,
    "positions": [
      {
        "label": "POSITION 1",
        "ordinal": 0,
        "positionId": "p1",
        "questionFunction": null
      },
      {
        "label": "POSITION 2",
        "ordinal": 1,
        "positionId": "p2",
        "questionFunction": null
      },
      {
        "label": "POSITION 3",
        "ordinal": 2,
        "positionId": "p3",
        "questionFunction": null
      },
      {
        "label": "POSITION 4",
        "ordinal": 3,
        "positionId": "p4",
        "questionFunction": null
      },
      {
        "label": "POSITION 5",
        "ordinal": 4,
        "positionId": "p5",
        "questionFunction": null
      },
      {
        "label": "POSITION 6",
        "ordinal": 5,
        "positionId": "p6",
        "questionFunction": null
      },
      {
        "label": "POSITION 7",
        "ordinal": 6,
        "positionId": "p7",
        "questionFunction": null
      },
      {
        "label": "POSITION 8",
        "ordinal": 7,
        "positionId": "p8",
        "questionFunction": null
      },
      {
        "label": "POSITION 9",
        "ordinal": 8,
        "positionId": "p9",
        "questionFunction": null
      },
      {
        "label": "POSITION 10",
        "ordinal": 9,
        "positionId": "p10",
        "questionFunction": null
      }
    ],
    "semanticStatus": "PROVISIONAL",
    "spreadId": "legacy.cross.v031",
    "topology": {
      "orderedAdjacency": [],
      "visualEdges": []
    },
    "version": "0.31.0"
  }
});
