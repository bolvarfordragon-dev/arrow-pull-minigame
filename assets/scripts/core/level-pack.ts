import type { Level } from "./types";

/** 由 tools/generate-levels.ts 生成，与 assets/resources/levels 内容一致。 */
export const LEVEL_PACK: readonly Level[] = [
  {
    "id": 1,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 3,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1"
    ]
  },
  {
    "id": 2,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 2,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2"
    ]
  },
  {
    "id": 3,
    "lines": [
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 3,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 1,
        "dir": "N"
      }
    ],
    "solution": [
      "a1"
    ]
  },
  {
    "id": 4,
    "lines": [
      {
        "axis": "V",
        "fixed": 0,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 0,
        "y": 1,
        "dir": "N"
      }
    ],
    "solution": [
      "a1",
      "a2"
    ]
  },
  {
    "id": 5,
    "lines": [
      {
        "axis": "H",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 2,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 2,
        "y": 1,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 2,
        "y": 0,
        "dir": "N"
      }
    ],
    "solution": [
      "a1",
      "a2"
    ]
  },
  {
    "id": 6,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 7,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 4,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 4,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 2,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 4,
        "y": 3,
        "dir": "S"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 8,
    "lines": [
      {
        "axis": "H",
        "fixed": 1,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": false
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 1,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 2,
        "y": 1,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 5,
        "y": 4,
        "dir": "S"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 9,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 5,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 5,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 4,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 2,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a2",
      "a3",
      "a1"
    ]
  },
  {
    "id": 10,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 11,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 4,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 12,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 5,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 5,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 4,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 2,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4"
    ]
  },
  {
    "id": 13,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 14,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 15,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 5,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 5,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4"
    ]
  },
  {
    "id": 16,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 1,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 0,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a5",
        "x": 6,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 17,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 18,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 2,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4"
    ]
  },
  {
    "id": 19,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 4,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 2,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 20,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 6,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 21,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 5,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 5,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 0,
        "dir": "S"
      },
      {
        "id": "a2",
        "x": 4,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4"
    ]
  },
  {
    "id": 22,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 8,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 2,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 23,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a3",
        "x": 6,
        "y": 2,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3"
    ]
  },
  {
    "id": 24,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a4",
        "x": 6,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4"
    ]
  },
  {
    "id": 25,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 2,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 2,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 6,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 26,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 1,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 9,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 27,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 4,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6"
    ]
  },
  {
    "id": 28,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a5",
        "x": 7,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 1,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 29,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 6,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 9,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 8,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 1,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 8,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 30,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 6,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 4,
        "dir": "S"
      },
      {
        "id": "a4",
        "x": 5,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 4,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 31,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 1,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 7,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6"
    ]
  },
  {
    "id": 32,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 2,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 33,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 4,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 34,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 4,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 4,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 35,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 0,
        "dir": "S"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 1,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 6,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6"
    ]
  },
  {
    "id": 36,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 0,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a6",
        "x": 2,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a7",
        "x": 6,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 37,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 2,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 1,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a7",
        "x": 5,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a8",
        "x": 8,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 38,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 8,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 8,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 39,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6"
    ]
  },
  {
    "id": 40,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 2,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a7",
        "x": 6,
        "y": 2,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 41,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 10,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 10,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 10,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 4,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a7",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 42,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 7,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5"
    ]
  },
  {
    "id": 43,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 2,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a6",
        "x": 7,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6"
    ]
  },
  {
    "id": 44,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 1,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 8,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 2,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 45,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 3,
        "dir": "S"
      },
      {
        "id": "a6",
        "x": 4,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 4,
        "dir": "S"
      },
      {
        "id": "a8",
        "x": 1,
        "y": 4,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 46,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 5,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 4,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a7",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 47,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 5,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 8,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 4,
        "dir": "S"
      },
      {
        "id": "a6",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 2,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a8",
        "x": 1,
        "y": 4,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 48,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 6,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 5,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 0,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a9",
        "x": 7,
        "y": 2,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9"
    ]
  },
  {
    "id": 49,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 6,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 5,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 5,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a6",
        "x": 5,
        "y": 1,
        "dir": "S"
      },
      {
        "id": "a7",
        "x": 8,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a8",
        "x": 5,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a9",
        "x": 3,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a10",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "a10"
    ]
  },
  {
    "id": 50,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 10,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 10,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 10,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 6,
        "start": 0,
        "end": 10,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 10,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 7,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a5",
        "x": 6,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 1,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 0,
        "y": 6,
        "dir": "W"
      },
      {
        "id": "a8",
        "x": 1,
        "y": 5,
        "dir": "S"
      },
      {
        "id": "a9",
        "x": 3,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a10",
        "x": 1,
        "y": 6,
        "dir": "S"
      },
      {
        "id": "a11",
        "x": 9,
        "y": 6,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "a10",
      "a11"
    ]
  },
  {
    "id": 51,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 6,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 0,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 8,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 3,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 7,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 5,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 1,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a9",
        "x": 5,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a10",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a11",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a12",
        "x": 8,
        "y": 2,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "a10",
      "a11",
      "a12"
    ]
  },
  {
    "id": 52,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 0,
        "dir": "S"
      },
      {
        "id": "a5",
        "x": 1,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 8,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 0,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 53,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 11,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 11,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 11,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 11,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 10,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 0,
        "dir": "S"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 4,
        "dir": "S"
      },
      {
        "id": "a7",
        "x": 11,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a8",
        "x": 1,
        "y": 4,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 54,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 6,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 8,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 4,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 8,
        "y": 6,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 7,
        "y": 6,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 6,
        "y": 6,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 4,
        "y": 6,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a8",
        "x": 3,
        "y": 6,
        "dir": "S"
      },
      {
        "id": "a9",
        "x": 0,
        "y": 6,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9"
    ]
  },
  {
    "id": 55,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 8,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 6,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 5,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a6",
        "x": 0,
        "y": 0,
        "dir": "W"
      },
      {
        "id": "a7",
        "x": 5,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a9",
        "x": 5,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a10",
        "x": 7,
        "y": 0,
        "dir": "W"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "a10"
    ]
  },
  {
    "id": 56,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 11,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 11,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 11,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 0,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 2,
        "dir": "W"
      },
      {
        "id": "a5",
        "x": 10,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 0,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a8",
        "x": 9,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a9",
        "x": 7,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a10",
        "x": 3,
        "y": 0,
        "dir": "N"
      },
      {
        "id": "a11",
        "x": 1,
        "y": 0,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "a10",
      "a11"
    ]
  },
  {
    "id": 57,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 7,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 7,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 6,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a3",
        "x": 5,
        "y": 0,
        "dir": "S"
      },
      {
        "id": "a4",
        "x": 1,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 4,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 5,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 3,
        "y": 0,
        "dir": "E"
      },
      {
        "id": "a9",
        "x": 5,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a10",
        "x": 6,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a11",
        "x": 3,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a12",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "a10",
      "a11",
      "a12"
    ]
  },
  {
    "id": 58,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 6,
        "start": 0,
        "end": 9,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 9,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a2",
        "x": 3,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 8,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 5,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a6",
        "x": 7,
        "y": 4,
        "dir": "E"
      },
      {
        "id": "a7",
        "x": 1,
        "y": 4,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7"
    ]
  },
  {
    "id": 59,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 9,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 4,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 5,
        "start": 0,
        "end": 4,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a2",
        "x": 5,
        "y": 0,
        "dir": "S"
      },
      {
        "id": "a3",
        "x": 7,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a4",
        "x": 5,
        "y": 2,
        "dir": "S"
      },
      {
        "id": "a5",
        "x": 3,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a6",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a7",
        "x": 2,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a8",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8"
    ]
  },
  {
    "id": 60,
    "lines": [
      {
        "axis": "H",
        "fixed": 0,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 2,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 4,
        "start": 0,
        "end": 8,
        "exitStart": true,
        "exitEnd": true
      },
      {
        "axis": "H",
        "fixed": 6,
        "start": 0,
        "end": 8,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 1,
        "start": 0,
        "end": 6,
        "exitStart": false,
        "exitEnd": true
      },
      {
        "axis": "V",
        "fixed": 3,
        "start": 0,
        "end": 6,
        "exitStart": true,
        "exitEnd": true
      }
    ],
    "arrows": [
      {
        "id": "a1",
        "x": 1,
        "y": 4,
        "dir": "W"
      },
      {
        "id": "a2",
        "x": 1,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a3",
        "x": 1,
        "y": 3,
        "dir": "N"
      },
      {
        "id": "a4",
        "x": 3,
        "y": 6,
        "dir": "N"
      },
      {
        "id": "a5",
        "x": 8,
        "y": 2,
        "dir": "E"
      },
      {
        "id": "a6",
        "x": 1,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a7",
        "x": 3,
        "y": 4,
        "dir": "N"
      },
      {
        "id": "a8",
        "x": 3,
        "y": 2,
        "dir": "N"
      },
      {
        "id": "a9",
        "x": 0,
        "y": 2,
        "dir": "E"
      }
    ],
    "solution": [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9"
    ]
  }
];
