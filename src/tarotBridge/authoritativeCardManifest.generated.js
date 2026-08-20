// GENERATED FILE — DO NOT HAND EDIT.
// Source: bookthief666/tarot-archetype-vr@f4534b4f92d88f3950ec0c9c211bfa4648cd08ea

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const AUTHORITATIVE_CARD_MANIFEST_META = deepFreeze({
  "contractId": "grimoire.tarot.semantic.v1",
  "contractVersion": "1.0.0",
  "authorityRepository": "bookthief666/tarot-archetype-vr",
  "authorityCommit": "f4534b4f92d88f3950ec0c9c211bfa4648cd08ea",
  "cardCount": 78,
  "generatedFrom": "0.48 validated VR conformance parity core"
});

export const AUTHORITATIVE_CARD_MANIFEST = deepFreeze([
  {
    "arcana": "major",
    "cardId": "major.fool",
    "familyId": "fool",
    "legacyIndex": 0,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.fool.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE FOOL"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.fool.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE FOOL"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.fool.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "0"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.magician",
    "familyId": "magician",
    "legacyIndex": 1,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.magician.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE JUGGLER"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth-deck-face.magician.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley-harris.thoth-deck.usgames"
          ],
          "value": "THE MAGUS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.magician.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "I"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.priestess",
    "familyId": "priestess",
    "legacyIndex": 2,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.priestess.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE HIGH PRIESTESS"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth-deck-face.priestess.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley-harris.thoth-deck.usgames"
          ],
          "value": "THE PRIESTESS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.priestess.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "II"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.empress",
    "familyId": "empress",
    "legacyIndex": 3,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.empress.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE EMPRESS"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.empress.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE EMPRESS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.empress.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "III"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.emperor",
    "familyId": "emperor",
    "legacyIndex": 4,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {
        "hebrewLetter": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.emperor-tzaddi-aries"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TZADDI"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.emperor-tzaddi-aries"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ARIES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.emperor.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE EMPEROR"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.emperor.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE EMPEROR"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.emperor.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "IV"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.hierophant",
    "familyId": "hierophant",
    "legacyIndex": 5,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hierophant.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE HIEROPHANT"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hierophant.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE HIEROPHANT"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hierophant.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "V"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.lovers",
    "familyId": "lovers",
    "legacyIndex": 6,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.lovers.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [
              "THE BROTHERS"
            ],
            "primaryTitle": "THE LOVERS"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.lovers.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE LOVERS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.lovers.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VI"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.chariot",
    "familyId": "chariot",
    "legacyIndex": 7,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.chariot.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE CHARIOT"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.chariot.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE CHARIOT"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.chariot.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VII"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.fortitude",
    "familyId": "fortitude",
    "legacyIndex": 8,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.lust-xi"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LUST"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.lust-xi"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XI"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.hermit",
    "familyId": "hermit",
    "legacyIndex": 9,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hermit.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE HERMIT"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hermit.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE HERMIT"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hermit.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "IX"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.wheel",
    "familyId": "wheel",
    "legacyIndex": 10,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.wheel.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "FORTUNE"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.wheel.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FORTUNE"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.wheel.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "X"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.justice",
    "familyId": "justice",
    "legacyIndex": 11,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.adjustment-viii"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ADJUSTMENT"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.adjustment-viii"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VIII"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.hanged",
    "familyId": "hanged",
    "legacyIndex": 12,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hanged.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE HANGED MAN"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hanged.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE HANGED MAN"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.hanged.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XII"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.death",
    "familyId": "death",
    "legacyIndex": 13,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.death.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "DEATH"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.death.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DEATH"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.death.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XIII"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.temperance",
    "familyId": "temperance",
    "legacyIndex": 14,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.temperance.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "ART"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.temperance.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ART"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.temperance.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XIV"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.devil",
    "familyId": "devil",
    "legacyIndex": 15,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.devil.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE DEVIL"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.devil.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE DEVIL"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.devil.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XV"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.tower",
    "familyId": "tower",
    "legacyIndex": 16,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.tower.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [
              "WAR"
            ],
            "primaryTitle": "THE TOWER"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.tower.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE TOWER"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.tower.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XVI"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.star",
    "familyId": "star",
    "legacyIndex": 17,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {
        "hebrewLetter": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.star-heh-aquarius"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.star-heh-aquarius"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AQUARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.star.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE STAR"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.star.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE STAR"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.star.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XVII"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.moon",
    "familyId": "moon",
    "legacyIndex": 18,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.moon.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE MOON"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.moon.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE MOON"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.moon.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XVIII"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.sun",
    "familyId": "sun",
    "legacyIndex": 19,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.sun.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE SUN"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.sun.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE SUN"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.sun.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XIX"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.judgement",
    "familyId": "judgement",
    "legacyIndex": 20,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.judgement.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE AEON"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.judgement.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE AEON"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.judgement.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XX"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "major",
    "cardId": "major.world",
    "familyId": "world",
    "legacyIndex": 21,
    "rankClass": null,
    "rankId": null,
    "suitFamilyId": null,
    "thoth": {
      "correspondences": {},
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "bookNomenclature": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.world.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "alternateTitles": [],
            "primaryTitle": "THE UNIVERSE"
          }
        },
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.world.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE UNIVERSE"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.atu.world.book-nomenclature"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "XXI"
        },
        "rankName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "suitName": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.ace",
    "familyId": "staffs",
    "legacyIndex": 22,
    "rankClass": "pip",
    "rankId": "ace",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "rootElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.staffs.root",
            "claim.thoth1944.aces.elemental-roots"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.staffs.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.staffs.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE ROOT OF THE POWERS OF FIRE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.staffs.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.two",
    "familyId": "staffs",
    "legacyIndex": 23,
    "rankClass": "pip",
    "rankId": "two",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MARS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ARIES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DOMINION"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.three",
    "familyId": "staffs",
    "legacyIndex": 24,
    "rankClass": "pip",
    "rankId": "three",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SUN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ARIES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VIRTUE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.four",
    "familyId": "staffs",
    "legacyIndex": 25,
    "rankClass": "pip",
    "rankId": "four",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VENUS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ARIES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "COMPLETION"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.five",
    "familyId": "staffs",
    "legacyIndex": 26,
    "rankClass": "pip",
    "rankId": "five",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SATURN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LEO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "STRIFE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.six",
    "familyId": "staffs",
    "legacyIndex": 27,
    "rankClass": "pip",
    "rankId": "six",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "JUPITER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LEO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VICTORY"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.seven",
    "familyId": "staffs",
    "legacyIndex": 28,
    "rankClass": "pip",
    "rankId": "seven",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MARS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LEO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VALOUR"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.eight",
    "familyId": "staffs",
    "legacyIndex": 29,
    "rankClass": "pip",
    "rankId": "eight",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MERCURY"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SAGITTARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWIFTNESS"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.nine",
    "familyId": "staffs",
    "legacyIndex": 30,
    "rankClass": "pip",
    "rankId": "nine",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MOON"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SAGITTARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "STRENGTH"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.ten",
    "familyId": "staffs",
    "legacyIndex": 31,
    "rankClass": "pip",
    "rankId": "ten",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SATURN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SAGITTARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN OF WANDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "OPPRESSION"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.staffs.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.page",
    "familyId": "staffs",
    "legacyIndex": 32,
    "rankClass": "court",
    "rankId": "page",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH_FINAL"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.princess",
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS OF WANDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.knight",
    "familyId": "staffs",
    "legacyIndex": 33,
    "rankClass": "court",
    "rankId": "knight",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VAU"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.prince",
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE OF WANDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.queen",
    "familyId": "staffs",
    "legacyIndex": 34,
    "rankClass": "court",
    "rankId": "queen",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.queen",
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN OF WANDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.staffs.king",
    "familyId": "staffs",
    "legacyIndex": 35,
    "rankClass": "court",
    "rankId": "king",
    "suitFamilyId": "staffs",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "YOD"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.knight",
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT OF WANDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.wands-fire"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WANDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.ace",
    "familyId": "cups",
    "legacyIndex": 36,
    "rankClass": "pip",
    "rankId": "ace",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "rootElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.cups.root",
            "claim.thoth1944.aces.elemental-roots"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.cups.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.cups.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE ROOT OF THE POWERS OF WATER"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.cups.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.two",
    "familyId": "cups",
    "legacyIndex": 37,
    "rankClass": "pip",
    "rankId": "two",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VENUS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CANCER"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LOVE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.three",
    "familyId": "cups",
    "legacyIndex": 38,
    "rankClass": "pip",
    "rankId": "three",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MERCURY"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CANCER"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ABUNDANCE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.four",
    "familyId": "cups",
    "legacyIndex": 39,
    "rankClass": "pip",
    "rankId": "four",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MOON"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CANCER"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LUXURY"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.five",
    "familyId": "cups",
    "legacyIndex": 40,
    "rankClass": "pip",
    "rankId": "five",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MARS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SCORPIO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISAPPOINTMENT"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.six",
    "familyId": "cups",
    "legacyIndex": 41,
    "rankClass": "pip",
    "rankId": "six",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SUN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SCORPIO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PLEASURE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.seven",
    "familyId": "cups",
    "legacyIndex": 42,
    "rankClass": "pip",
    "rankId": "seven",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VENUS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SCORPIO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DEBAUCH"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.eight",
    "familyId": "cups",
    "legacyIndex": 43,
    "rankClass": "pip",
    "rankId": "eight",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SATURN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PISCES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "INDOLENCE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.nine",
    "familyId": "cups",
    "legacyIndex": 44,
    "rankClass": "pip",
    "rankId": "nine",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "JUPITER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PISCES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HAPPINESS"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.ten",
    "familyId": "cups",
    "legacyIndex": 45,
    "rankClass": "pip",
    "rankId": "ten",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MARS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PISCES"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN OF CUPS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SATIETY"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.cups.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.page",
    "familyId": "cups",
    "legacyIndex": 46,
    "rankClass": "court",
    "rankId": "page",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH_FINAL"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.princess",
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS OF CUPS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.knight",
    "familyId": "cups",
    "legacyIndex": 47,
    "rankClass": "court",
    "rankId": "knight",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VAU"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.prince",
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE OF CUPS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.queen",
    "familyId": "cups",
    "legacyIndex": 48,
    "rankClass": "court",
    "rankId": "queen",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.queen",
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN OF CUPS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.cups.king",
    "familyId": "cups",
    "legacyIndex": 49,
    "rankClass": "court",
    "rankId": "king",
    "suitFamilyId": "cups",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "YOD"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.knight",
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT OF CUPS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.cups-water"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CUPS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.ace",
    "familyId": "swords",
    "legacyIndex": 50,
    "rankClass": "pip",
    "rankId": "ace",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "rootElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.swords.root",
            "claim.thoth1944.aces.elemental-roots"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.swords.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.swords.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE ROOT OF THE POWERS OF AIR"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.swords.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.two",
    "familyId": "swords",
    "legacyIndex": 51,
    "rankClass": "pip",
    "rankId": "two",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MOON"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LIBRA"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PEACE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.three",
    "familyId": "swords",
    "legacyIndex": 52,
    "rankClass": "pip",
    "rankId": "three",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SATURN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LIBRA"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SORROW"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.four",
    "familyId": "swords",
    "legacyIndex": 53,
    "rankClass": "pip",
    "rankId": "four",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "JUPITER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "LIBRA"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TRUCE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.five",
    "familyId": "swords",
    "legacyIndex": 54,
    "rankClass": "pip",
    "rankId": "five",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VENUS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AQUARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DEFEAT"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.six",
    "familyId": "swords",
    "legacyIndex": 55,
    "rankClass": "pip",
    "rankId": "six",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MERCURY"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AQUARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SCIENCE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.seven",
    "familyId": "swords",
    "legacyIndex": 56,
    "rankClass": "pip",
    "rankId": "seven",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MOON"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AQUARIUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FUTILITY"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.eight",
    "familyId": "swords",
    "legacyIndex": 57,
    "rankClass": "pip",
    "rankId": "eight",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "JUPITER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "GEMINI"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "INTERFERENCE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.nine",
    "familyId": "swords",
    "legacyIndex": 58,
    "rankClass": "pip",
    "rankId": "nine",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MARS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "GEMINI"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CRUELTY"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.ten",
    "familyId": "swords",
    "legacyIndex": 59,
    "rankClass": "pip",
    "rankId": "ten",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SUN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "GEMINI"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN OF SWORDS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "RUIN"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.swords.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.page",
    "familyId": "swords",
    "legacyIndex": 60,
    "rankClass": "court",
    "rankId": "page",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH_FINAL"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.princess",
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS OF SWORDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.knight",
    "familyId": "swords",
    "legacyIndex": 61,
    "rankClass": "court",
    "rankId": "knight",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VAU"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.prince",
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE OF SWORDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.queen",
    "familyId": "swords",
    "legacyIndex": 62,
    "rankClass": "court",
    "rankId": "queen",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.queen",
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN OF SWORDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.swords.king",
    "familyId": "swords",
    "legacyIndex": 63,
    "rankClass": "court",
    "rankId": "king",
    "suitFamilyId": "swords",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "YOD"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.knight",
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT OF SWORDS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.swords-air"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SWORDS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.ace",
    "familyId": "coins",
    "legacyIndex": 64,
    "rankClass": "pip",
    "rankId": "ace",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "rootElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.coins.root",
            "claim.thoth1944.aces.elemental-roots"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.coins.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.coins.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THE ROOT OF THE POWERS OF THE EARTH"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.ace.coins.expression"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "ACE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.two",
    "familyId": "coins",
    "legacyIndex": 65,
    "rankClass": "pip",
    "rankId": "two",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "JUPITER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CAPRICORN"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CHANGE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.two.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TWO"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.three",
    "familyId": "coins",
    "legacyIndex": 66,
    "rankClass": "pip",
    "rankId": "three",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MARS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CAPRICORN"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WORK"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.three.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "THREE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.four",
    "familyId": "coins",
    "legacyIndex": 67,
    "rankClass": "pip",
    "rankId": "four",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SUN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "CAPRICORN"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "POWER"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.four.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FOUR"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.five",
    "familyId": "coins",
    "legacyIndex": 68,
    "rankClass": "pip",
    "rankId": "five",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MERCURY"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TAURUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WORRY"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.five.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIVE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.six",
    "familyId": "coins",
    "legacyIndex": 69,
    "rankClass": "pip",
    "rankId": "six",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MOON"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TAURUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SUCCESS"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.six.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SIX"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.seven",
    "familyId": "coins",
    "legacyIndex": 70,
    "rankClass": "pip",
    "rankId": "seven",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SATURN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TAURUS"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FAILURE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.seven.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SEVEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.eight",
    "familyId": "coins",
    "legacyIndex": 71,
    "rankClass": "pip",
    "rankId": "eight",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 1
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 10,
            "start": 0,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "SUN"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VIRGO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRUDENCE"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.eight.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.nine",
    "familyId": "coins",
    "legacyIndex": 72,
    "rankClass": "pip",
    "rankId": "nine",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 2
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 20,
            "start": 10,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VENUS"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VIRGO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "GAIN"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.nine.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "NINE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.ten",
    "familyId": "coins",
    "legacyIndex": 73,
    "rankClass": "pip",
    "rankId": "ten",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "decanOrdinal": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": 3
        },
        "degreeRange": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.decan",
            "claim.thoth1944.small-cards.decan-structure"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": {
            "authority": "DERIVED_FROM_REVIEWED_DECAN_STRUCTURE",
            "end": 30,
            "start": 20,
            "unit": "DEGREES_OF_SIGN"
          }
        },
        "planet": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "MERCURY"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "zodiacSign": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.decan"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VIRGO"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN OF DISKS"
        },
        "nativeTitle": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WEALTH"
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.small-card.coins.ten.title"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "TEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.page",
    "familyId": "coins",
    "legacyIndex": 74,
    "rankClass": "court",
    "rankId": "page",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH_FINAL"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.princess",
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS OF DISKS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.princess"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCESS"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.knight",
    "familyId": "coins",
    "legacyIndex": 75,
    "rankClass": "court",
    "rankId": "knight",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "AIR"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "VAU"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.prince",
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE OF DISKS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.prince"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "PRINCE"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.queen",
    "familyId": "coins",
    "legacyIndex": 76,
    "rankClass": "court",
    "rankId": "queen",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "WATER"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "HEH"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.queen",
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN OF DISKS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.queen"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "QUEEN"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  },
  {
    "arcana": "minor",
    "cardId": "minor.coins.king",
    "familyId": "coins",
    "legacyIndex": 77,
    "rankClass": "court",
    "rankId": "king",
    "suitFamilyId": "coins",
    "thoth": {
      "correspondences": {
        "rankElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "FIRE"
        },
        "suitElement": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "EARTH"
        },
        "tetragrammaton": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "YOD"
        }
      },
      "expressionCoverage": "FULL",
      "fallbackUsed": false,
      "fields": {
        "displayName": {
          "authority": "DERIVED_FROM_VERIFIED_SOURCE_FIELDS",
          "claimIds": [
            "claim.thoth1944.dignitary.knight",
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT OF DISKS"
        },
        "nativeTitle": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "printedNumber": {
          "authority": "NOT_APPLICABLE",
          "claimIds": [],
          "semanticStatus": "CANONICAL_PROJECT",
          "sourceIds": [],
          "value": null
        },
        "rankName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.dignitary.knight"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "KNIGHT"
        },
        "suitName": {
          "authority": "SOURCE_PACK_VERIFIED",
          "claimIds": [
            "claim.thoth1944.suit.disks-earth"
          ],
          "semanticStatus": "CANONICAL",
          "sourceIds": [
            "src.primary.crowley.book-of-thoth.1944"
          ],
          "value": "DISKS"
        }
      }
    }
  }
]);
