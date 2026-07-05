import * as Blockly from "blockly";

/**
 * Built-in example programs, stored as Blockly JSON workspace state.
 */
const samples: Record<string, any> = {
  "factorial": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": 50,
          "y": 50,
          "deletable": false,
          "extraState": {
            "itemCount": 2
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "dec_fun",
                "id": "Yts1OOhrk}hc}p#^8VER",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "funmatch_more_row",
                      "id": ",nR,1~iM;!:7!@M|.,zg",
                      "extraState": {
                        "itemCount": 2
                      },
                      "fields": {
                        "desc1": "or"
                      },
                      "inputs": {
                        "ADD0": {
                          "block": {
                            "type": "funmatch_nonfix",
                            "id": "@}**!{~Vz*)Itsi!7^YT",
                            "extraState": {
                              "itemCount": 1
                            },
                            "fields": {
                              "optr": " ",
                              "chkTyp": false
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "fR!d}Vw)r$%cd:iyV2XP",
                                  "fields": {
                                    "inputValue": "fact"
                                  }
                                }
                              },
                              "ADD0": {
                                "block": {
                                  "type": "con_int",
                                  "id": "]Ct68:+(wN{8WGU7xI0I",
                                  "fields": {
                                    "inputValue": 0
                                  }
                                }
                              },
                              "exp": {
                                "block": {
                                  "type": "con_int",
                                  "id": "20V?1|[X+`HU~Qc$KO[_",
                                  "fields": {
                                    "inputValue": 1
                                  }
                                }
                              }
                            }
                          }
                        },
                        "ADD1": {
                          "block": {
                            "type": "funmatch_nonfix",
                            "id": "u_y}3aerP$:AwGI(@y6y",
                            "inline": false,
                            "extraState": {
                              "itemCount": 1
                            },
                            "fields": {
                              "optr": " ",
                              "chkTyp": false
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "o`VZ1/%UwMGi%JAYqa(8",
                                  "fields": {
                                    "inputValue": "fact"
                                  }
                                }
                              },
                              "ADD0": {
                                "block": {
                                  "type": "pat_id",
                                  "id": "^*E{KODC,~27Ea)nQ14#",
                                  "fields": {
                                    "OP": "nothing"
                                  },
                                  "inputs": {
                                    "id": {
                                      "block": {
                                        "type": "id_id",
                                        "id": "ux5:49g/9!5(K[H0jCA+",
                                        "fields": {
                                          "inputValue": "n"
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "exp": {
                                "block": {
                                  "type": "exp_primtv_optr_arith",
                                  "id": "ZIr2h6_rFZ.3/s_u*bTP",
                                  "inline": false,
                                  "fields": {
                                    "opt": "*"
                                  },
                                  "inputs": {
                                    "exp_1": {
                                      "block": {
                                        "type": "exp_bound",
                                        "id": "a*4dPHkV`+=2ApufoSQs",
                                        "fields": {
                                          "opt": "NON_OP"
                                        },
                                        "inputs": {
                                          "longid": {
                                            "block": {
                                              "type": "id_long_id",
                                              "id": "7Gj;%r!IS+u%M$SY]pw[",
                                              "extraState": {
                                                "itemCount": 1
                                              },
                                              "inputs": {
                                                "ADD0": {
                                                  "block": {
                                                    "type": "id_id",
                                                    "id": "!gj/-h3da:|%wN0y7tGV",
                                                    "fields": {
                                                      "inputValue": "n"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "exp_2": {
                                      "block": {
                                        "type": "exp_application",
                                        "id": "sOm{@qp12YTh9uBz%7:o",
                                        "inputs": {
                                          "exp1": {
                                            "block": {
                                              "type": "exp_bound",
                                              "id": "4ua6vt[X^+[f-+/;l6%|",
                                              "fields": {
                                                "opt": "NON_OP"
                                              },
                                              "inputs": {
                                                "longid": {
                                                  "block": {
                                                    "type": "id_long_id",
                                                    "id": "=~S|_Osb4-}u+L2TPz,M",
                                                    "extraState": {
                                                      "itemCount": 1
                                                    },
                                                    "inputs": {
                                                      "ADD0": {
                                                        "block": {
                                                          "type": "id_id",
                                                          "id": "zL~yAsri##Lw}J^bM]JJ",
                                                          "fields": {
                                                            "inputValue": "fact"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "exp2": {
                                            "block": {
                                              "type": "exp_primtv_optr_arith",
                                              "id": "x}C3r2,VjEEeFCo|G)y3",
                                              "inline": false,
                                              "fields": {
                                                "opt": "-"
                                              },
                                              "inputs": {
                                                "exp_1": {
                                                  "block": {
                                                    "type": "exp_bound",
                                                    "id": "Z$;m}@{qJs,_+ejy:c8C",
                                                    "fields": {
                                                      "opt": "NON_OP"
                                                    },
                                                    "inputs": {
                                                      "longid": {
                                                        "block": {
                                                          "type": "id_long_id",
                                                          "id": "aK||P2eVgwZB=}hiL$Tk",
                                                          "extraState": {
                                                            "itemCount": 1
                                                          },
                                                          "inputs": {
                                                            "ADD0": {
                                                              "block": {
                                                                "type": "id_id",
                                                                "id": "AG}O71e/]!#9mw4c=t+6",
                                                                "fields": {
                                                                  "inputValue": "n"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                "exp_2": {
                                                  "block": {
                                                    "type": "con_int",
                                                    "id": "4*k)*saqkf_|q+;MAPN+",
                                                    "fields": {
                                                      "inputValue": 1
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "ADD1": {
              "block": {
                "type": "dec_val",
                "id": "~-V4A})-qG7C_YK1wV#K",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "valbind",
                      "id": "fu1Q~eH62J~Z{8RL9s{,",
                      "fields": {
                        "recVal": ""
                      },
                      "inputs": {
                        "pat": {
                          "block": {
                            "type": "pat_id",
                            "id": "or+~MxI8O8:gNvI_%p*P",
                            "fields": {
                              "OP": "nothing"
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "hEZF|ssZMz)6_HMr;OBl",
                                  "fields": {
                                    "inputValue": "fact4"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "exp": {
                          "block": {
                            "type": "exp_application",
                            "id": "-?Oum:C+4YjJzVWVaCaQ",
                            "inputs": {
                              "exp1": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "{DCICV-Pk[Ax$xxNu)kb",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "AIP4s##P+wlL[0Ho$]r3",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": "=^nli:PE5e=?=_[;Y7N[",
                                              "fields": {
                                                "inputValue": "fact"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "exp2": {
                                "block": {
                                  "type": "con_int",
                                  "id": "JNS^^]Hw$PG,K4`5OQrv",
                                  "fields": {
                                    "inputValue": 4
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "fCurrying": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": 90,
          "y": 130,
          "deletable": false,
          "extraState": {
            "itemCount": 1
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "dec_fun",
                "id": "G_x)2}W#L%-Zvd(KdW,.",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "funmatch_nonfix",
                      "id": "D0}s4?SrFnJvQw^@]/+:",
                      "inline": false,
                      "extraState": {
                        "itemCount": 2
                      },
                      "fields": {
                        "optr": " ",
                        "chkTyp": false
                      },
                      "inputs": {
                        "id": {
                          "block": {
                            "type": "id_id",
                            "id": "W7%M=%r{xL(7D[3sf6qP",
                            "fields": {
                              "inputValue": "fCurrying"
                            }
                          }
                        },
                        "ADD0": {
                          "block": {
                            "type": "pat_id",
                            "id": "n|]UWoyO$!ry@*8tncrb",
                            "fields": {
                              "OP": "nothing"
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "-_IDW#I.t;cdcTKS`[bk",
                                  "fields": {
                                    "inputValue": "a"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "ADD1": {
                          "block": {
                            "type": "pat_id",
                            "id": "bx6)V|xLG7mv]2d|eG8+",
                            "fields": {
                              "OP": "nothing"
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "Y-J*nI[toeHo7AOx*:}|",
                                  "fields": {
                                    "inputValue": "b"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "exp": {
                          "block": {
                            "type": "exp_primtv_optr_arith",
                            "id": "z=h3(#f7!kc4#Q?]}FeD",
                            "inline": false,
                            "fields": {
                              "opt": "+"
                            },
                            "inputs": {
                              "exp_1": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "RrEAd-=ltqw/CegK]_*F",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "[sxgrGe6@kTF+7L}z{-M",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": "T@K?qL11]2qJHx_!^0XD",
                                              "fields": {
                                                "inputValue": "a"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "exp_2": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "jLCV=6;wXp0GBL@=pz+H",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "}wk}[;QI%lGzSq^F=hR-",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": "zIYb2fN](3`0+.}IU!(U",
                                              "fields": {
                                                "inputValue": "b"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "caseMatch": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": -370,
          "y": 250,
          "deletable": false,
          "extraState": {
            "itemCount": 1
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "dec_fun",
                "id": "amDr_n`EreI7Z7f,sg@p",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "funmatch_nonfix",
                      "id": "M4}]y?/jANMk*vRy?h-}",
                      "inline": false,
                      "extraState": {
                        "itemCount": 1
                      },
                      "fields": {
                        "optr": " ",
                        "chkTyp": false
                      },
                      "inputs": {
                        "id": {
                          "block": {
                            "type": "id_id",
                            "id": "C|XN+3=}/%wJZ311|`3E",
                            "fields": {
                              "inputValue": "list_info"
                            }
                          }
                        },
                        "ADD0": {
                          "block": {
                            "type": "pat_id",
                            "id": "76|hSY/UoJ$cjjTg`{tZ",
                            "fields": {
                              "OP": "nothing"
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "Q0~)b={_CFnlufnz)]Op",
                                  "fields": {
                                    "inputValue": "xs"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "exp": {
                          "block": {
                            "type": "exp_case",
                            "id": "rQMq/r682/k3_?suYun3",
                            "inputs": {
                              "case": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "9dDUbA69+vo-;YOC#o`a",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "8!=T+n-H_G45Sx~66#vr",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": ":1UYGBcjm~y;:h!2N=1v",
                                              "fields": {
                                                "inputValue": "xs"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "of": {
                                "block": {
                                  "type": "matchs",
                                  "id": "4GJhJPei`1Kcy{ne#X00",
                                  "extraState": {
                                    "itemCount": 3
                                  },
                                  "inputs": {
                                    "ADD0": {
                                      "block": {
                                        "type": "match",
                                        "id": "LHPj;?|Ya@3=H_:um+zI",
                                        "inline": false,
                                        "inputs": {
                                          "pat": {
                                            "block": {
                                              "type": "pat_list",
                                              "id": "B5!!JdMFBKV#q;/:/NfS",
                                              "extraState": {
                                                "itemCount": 0
                                              }
                                            }
                                          },
                                          "exp": {
                                            "block": {
                                              "type": "con_string",
                                              "id": ")[]MA.A-SF4Xf`n|QQJk",
                                              "fields": {
                                                "inputValue": "Empty List"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "ADD1": {
                                      "block": {
                                        "type": "match",
                                        "id": "Gk7]A9uq!/)~p3.t.Scf",
                                        "inline": false,
                                        "inputs": {
                                          "pat": {
                                            "block": {
                                              "type": "pat_list",
                                              "id": "`i*#H8N.wxk|Ut.%33gS",
                                              "extraState": {
                                                "itemCount": 1
                                              },
                                              "inputs": {
                                                "ADD0": {
                                                  "block": {
                                                    "type": "pat_id",
                                                    "id": "}wgy|jK=2w?p{)o8`(!z",
                                                    "fields": {
                                                      "OP": "nothing"
                                                    },
                                                    "inputs": {
                                                      "id": {
                                                        "block": {
                                                          "type": "id_id",
                                                          "id": "m|4RRRGatEwCOqbKQkeK",
                                                          "fields": {
                                                            "inputValue": "x"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "exp": {
                                            "block": {
                                              "type": "con_string",
                                              "id": "7*(J@1yaa+F?_,fd/j^X",
                                              "fields": {
                                                "inputValue": "Single element"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "ADD2": {
                                      "block": {
                                        "type": "match",
                                        "id": "yQ{]-rMb{-8A!W,A%e%{",
                                        "inline": false,
                                        "inputs": {
                                          "pat": {
                                            "block": {
                                              "type": "pat_wildcard",
                                              "id": "n#_N{@,+;a:pa^j8$vMB"
                                            }
                                          },
                                          "exp": {
                                            "block": {
                                              "type": "con_string",
                                              "id": "7Sy_VisyChA=/{1oq)Ql",
                                              "fields": {
                                                "inputValue": "At least two elements"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "binaryTree": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": 50,
          "y": 110,
          "deletable": false,
          "extraState": {
            "itemCount": 1
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "dec_datatype_bind",
                "id": "I8r[])C%)5kI~@0l{ghZ",
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "datbind": {
                    "block": {
                      "type": "datbind",
                      "id": "?O}}%sF5H(@K}Z@Sd)ZQ",
                      "fields": {
                        "chkTyp": true
                      },
                      "inputs": {
                        "inVar": {
                          "block": {
                            "type": "id_long_var",
                            "id": "{)Qjz3V5_Y9jS^E*[y1=",
                            "extraState": {
                              "itemCount": 1
                            },
                            "fields": {
                              "desc0": "",
                              "end_info": ""
                            },
                            "inputs": {
                              "ADD0": {
                                "block": {
                                  "type": "id_var",
                                  "id": "LB5`q7OLx^ny2G#5h8_w",
                                  "fields": {
                                    "constrType": "'",
                                    "inputValue": "a"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "id": {
                          "block": {
                            "type": "id_id",
                            "id": "l,z=np+PwDJF[F:{~S4y",
                            "fields": {
                              "inputValue": "bt"
                            }
                          }
                        },
                        "inConbind": {
                          "block": {
                            "type": "conbind_more_inhabitants",
                            "id": "()eyWLW#E[.xWZ%N*/vj",
                            "extraState": {
                              "itemCount": 2
                            },
                            "fields": {
                              "desc1": "or  "
                            },
                            "inputs": {
                              "ADD0": {
                                "block": {
                                  "type": "conbind",
                                  "id": "-V6bHAILz#gX-me5:]Ag",
                                  "fields": {
                                    "chkTyp": true
                                  },
                                  "inputs": {
                                    "id": {
                                      "block": {
                                        "type": "id_id",
                                        "id": "/ehjZc~hjje!rzz-HtTi",
                                        "fields": {
                                          "inputValue": "LEAF"
                                        }
                                      }
                                    },
                                    "inVar": {
                                      "block": {
                                        "type": "typ_var",
                                        "id": "xFYpl8s56``Ym#8QAX{J",
                                        "inputs": {
                                          "typ_var": {
                                            "block": {
                                              "type": "id_var",
                                              "id": "O7E#tCt[Rb*R*c|Rt|%]",
                                              "fields": {
                                                "constrType": "'",
                                                "inputValue": "a"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "ADD1": {
                                "block": {
                                  "type": "conbind",
                                  "id": "Wl,@,R[pNI{tyH*!o6DP",
                                  "fields": {
                                    "chkTyp": true
                                  },
                                  "inputs": {
                                    "id": {
                                      "block": {
                                        "type": "id_id",
                                        "id": "E^^YfHrI~myi4RbWuMB|",
                                        "fields": {
                                          "inputValue": "NODE"
                                        }
                                      }
                                    },
                                    "inVar": {
                                      "block": {
                                        "type": "typ_tuple",
                                        "id": "lu@|^tF+Q-dlci)tDX`.",
                                        "inline": false,
                                        "extraState": {
                                          "itemCount": 3
                                        },
                                        "fields": {
                                          "desc0": "",
                                          "desc1": "✱ ",
                                          "desc2": "✱ "
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "typ_constructor",
                                              "id": "4KQ#ig7Xg%`q8,2WHj-*",
                                              "extraState": {
                                                "itemCount": 1
                                              },
                                              "inputs": {
                                                "ADD0": {
                                                  "block": {
                                                    "type": "typ_var",
                                                    "id": "O3xM}UM[[~rq|qb7yDG}",
                                                    "inputs": {
                                                      "typ_var": {
                                                        "block": {
                                                          "type": "id_var",
                                                          "id": "#U`Pm4IXf7JtVk=rqZY,",
                                                          "fields": {
                                                            "constrType": "'",
                                                            "inputValue": "a"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                "longid": {
                                                  "block": {
                                                    "type": "id_long_id",
                                                    "id": "t.Mi$-ay^2pqtEO`3#g!",
                                                    "extraState": {
                                                      "itemCount": 1
                                                    },
                                                    "inputs": {
                                                      "ADD0": {
                                                        "block": {
                                                          "type": "id_id",
                                                          "id": "v-G}H.nf1eIq:1x#-]9a",
                                                          "fields": {
                                                            "inputValue": "bt"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "ADD1": {
                                            "block": {
                                              "type": "typ_var",
                                              "id": "uOKYA%,+ukg{B9VbBEQQ",
                                              "inputs": {
                                                "typ_var": {
                                                  "block": {
                                                    "type": "id_var",
                                                    "id": "P|mWcY*i!g4V;:uoJ?M)",
                                                    "fields": {
                                                      "constrType": "'",
                                                      "inputValue": "a"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "ADD2": {
                                            "block": {
                                              "type": "typ_constructor",
                                              "id": "(ECN7L_:OPGi,OC9pY%|",
                                              "extraState": {
                                                "itemCount": 1
                                              },
                                              "inputs": {
                                                "ADD0": {
                                                  "block": {
                                                    "type": "typ_var",
                                                    "id": "gx~`oI}LpYgIuT%kg:GE",
                                                    "inputs": {
                                                      "typ_var": {
                                                        "block": {
                                                          "type": "id_var",
                                                          "id": "yXstagHxOJ#!r-4sS(J#",
                                                          "fields": {
                                                            "constrType": "'",
                                                            "inputValue": "a"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                "longid": {
                                                  "block": {
                                                    "type": "id_long_id",
                                                    "id": "~Z6_NRK^RK_IpLX1?;c?",
                                                    "extraState": {
                                                      "itemCount": 1
                                                    },
                                                    "inputs": {
                                                      "ADD0": {
                                                        "block": {
                                                          "type": "id_id",
                                                          "id": "vnv0uxN-@7p])jTq9+i(",
                                                          "fields": {
                                                            "inputValue": "bt"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "fUncurrying": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": 50,
          "y": 110,
          "deletable": false,
          "extraState": {
            "itemCount": 2
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "dec_fun",
                "id": "G_x)2}W#L%-Zvd(KdW,.",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "funmatch_nonfix",
                      "id": "D0}s4?SrFnJvQw^@]/+:",
                      "inline": false,
                      "extraState": {
                        "itemCount": 1
                      },
                      "fields": {
                        "optr": " ",
                        "chkTyp": false
                      },
                      "inputs": {
                        "id": {
                          "block": {
                            "type": "id_id",
                            "id": "W7%M=%r{xL(7D[3sf6qP",
                            "fields": {
                              "inputValue": "fPlusCurry"
                            }
                          }
                        },
                        "ADD0": {
                          "block": {
                            "type": "pat_tuple",
                            "id": "PQ8FX;aiTfs29I|eyH`P",
                            "extraState": {
                              "itemCount": 2
                            },
                            "inputs": {
                              "ADD0": {
                                "block": {
                                  "type": "pat_id",
                                  "id": "bx6)V|xLG7mv]2d|eG8+",
                                  "fields": {
                                    "OP": "nothing"
                                  },
                                  "inputs": {
                                    "id": {
                                      "block": {
                                        "type": "id_id",
                                        "id": "Y-J*nI[toeHo7AOx*:}|",
                                        "fields": {
                                          "inputValue": "b"
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "ADD1": {
                                "block": {
                                  "type": "pat_id",
                                  "id": "n|]UWoyO$!ry@*8tncrb",
                                  "fields": {
                                    "OP": "nothing"
                                  },
                                  "inputs": {
                                    "id": {
                                      "block": {
                                        "type": "id_id",
                                        "id": "-_IDW#I.t;cdcTKS`[bk",
                                        "fields": {
                                          "inputValue": "a"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "exp": {
                          "block": {
                            "type": "exp_primtv_optr_arith",
                            "id": "z=h3(#f7!kc4#Q?]}FeD",
                            "fields": {
                              "opt": "+"
                            },
                            "inputs": {
                              "exp_1": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "RrEAd-=ltqw/CegK]_*F",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "[sxgrGe6@kTF+7L}z{-M",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": "T@K?qL11]2qJHx_!^0XD",
                                              "fields": {
                                                "inputValue": "a"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "exp_2": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "jLCV=6;wXp0GBL@=pz+H",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "}wk}[;QI%lGzSq^F=hR-",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": "zIYb2fN](3`0+.}IU!(U",
                                              "fields": {
                                                "inputValue": "b"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "ADD1": {
              "block": {
                "type": "dec_val",
                "id": "c`-qeln*g9Kbt*G]}Fg1",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "valbind",
                      "id": "jg/)2IUiWbXX!.M;@Wl;",
                      "inline": false,
                      "fields": {
                        "recVal": ""
                      },
                      "inputs": {
                        "pat": {
                          "block": {
                            "type": "pat_id",
                            "id": "x?K@5V3[l1]j/ZWZ;_=P",
                            "fields": {
                              "OP": "nothing"
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "KbyxX7Pej|_-eZG4c^u6",
                                  "fields": {
                                    "inputValue": "onePlusTwo"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "exp": {
                          "block": {
                            "type": "exp_application",
                            "id": "Td0![wEWP!Vn3sF`XOds",
                            "inputs": {
                              "exp1": {
                                "block": {
                                  "type": "exp_bound",
                                  "id": "57]hy)G=Vq{0M2x{V%lo",
                                  "fields": {
                                    "opt": "NON_OP"
                                  },
                                  "inputs": {
                                    "longid": {
                                      "block": {
                                        "type": "id_long_id",
                                        "id": "$NN]$`kyymzhWBh.iD3v",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "id_id",
                                              "id": "s]Ey6-t6Z+zj|^^g?c#C",
                                              "fields": {
                                                "inputValue": "fPlusCurry"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "exp2": {
                                "block": {
                                  "type": "exp_tuple",
                                  "id": "D1y;R/_FnaXz*Z#fkg!J",
                                  "extraState": {
                                    "itemCount": 2
                                  },
                                  "fields": {
                                    "desc0": "1",
                                    "desc1": "2"
                                  },
                                  "inputs": {
                                    "ADD0": {
                                      "block": {
                                        "type": "con_int",
                                        "id": "chIIKJ*:jP|NY$y!.IU5",
                                        "fields": {
                                          "inputValue": 1
                                        }
                                      }
                                    },
                                    "ADD1": {
                                      "block": {
                                        "type": "con_int",
                                        "id": "b8g$+$hjsv+*c24-rGq@",
                                        "fields": {
                                          "inputValue": 2
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "fPatterMatching": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": 50,
          "y": 230,
          "deletable": false,
          "extraState": {
            "itemCount": 1
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "dec_fun",
                "id": ".HfMVk-:^X|k.|l)bUg=",
                "extraState": {
                  "itemCount": 1
                },
                "fields": {
                  "chkTyp": false
                },
                "inputs": {
                  "ADD0": {
                    "block": {
                      "type": "funmatch_more_row",
                      "id": "t~gkZ*:~AUp0L(I2xx!a",
                      "extraState": {
                        "itemCount": 3
                      },
                      "fields": {
                        "desc1": "or",
                        "desc2": "or"
                      },
                      "inputs": {
                        "ADD0": {
                          "block": {
                            "type": "funmatch_nonfix",
                            "id": "^@}g2P~VSLw[8TUi8)0*",
                            "extraState": {
                              "itemCount": 1
                            },
                            "fields": {
                              "optr": " ",
                              "chkTyp": false
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "Y!cBTpLY2od3^;Akd(pk",
                                  "fields": {
                                    "inputValue": "fPatterMatching"
                                  }
                                }
                              },
                              "ADD0": {
                                "block": {
                                  "type": "con_int",
                                  "id": "{NnbTyd2[KO7)|,QB!?Q",
                                  "fields": {
                                    "inputValue": 1
                                  }
                                }
                              },
                              "exp": {
                                "block": {
                                  "type": "con_string",
                                  "id": "aX^Bh.T18sRLBA{QL:Rc",
                                  "fields": {
                                    "inputValue": "One"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "ADD1": {
                          "block": {
                            "type": "funmatch_nonfix",
                            "id": "JC3[,@z$TdO]Nv=l9MHC",
                            "extraState": {
                              "itemCount": 1
                            },
                            "fields": {
                              "optr": " ",
                              "chkTyp": false
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "~so.8A!cJkm6/~h9m6$8",
                                  "fields": {
                                    "inputValue": "fPatterMatching"
                                  }
                                }
                              },
                              "ADD0": {
                                "block": {
                                  "type": "con_int",
                                  "id": "lP7G1HxG~9gHt!w3Ewf^",
                                  "fields": {
                                    "inputValue": 2
                                  }
                                }
                              },
                              "exp": {
                                "block": {
                                  "type": "con_string",
                                  "id": "Pt*7S=Q{U+%IBZgCJaP|",
                                  "fields": {
                                    "inputValue": "Two"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "ADD2": {
                          "block": {
                            "type": "funmatch_nonfix",
                            "id": "z.VyV1xcg%sMDg9c1!hM",
                            "extraState": {
                              "itemCount": 1
                            },
                            "fields": {
                              "optr": " ",
                              "chkTyp": false
                            },
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "`j)]u+2(.,:7ImWYK8)8",
                                  "fields": {
                                    "inputValue": "fPatterMatching"
                                  }
                                }
                              },
                              "ADD0": {
                                "block": {
                                  "type": "pat_wildcard",
                                  "id": "o}nz3-+2LQ:J+,=Due[_"
                                }
                              },
                              "exp": {
                                "block": {
                                  "type": "con_string",
                                  "id": "qGU/4dBI-Uz}p/Aa*a`h",
                                  "fields": {
                                    "inputValue": "Unknown"
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "signatureNStructure": {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "program",
          "id": "wka+5-ZSnLLMV2hW(||?",
          "x": -50,
          "y": 230,
          "deletable": false,
          "extraState": {
            "itemCount": 2
          },
          "inputs": {
            "ADD0": {
              "block": {
                "type": "program_signature",
                "id": "H6KO4Fb9A]pSuE_QdAk;",
                "inputs": {
                  "sigbind": {
                    "block": {
                      "type": "sigbind_single",
                      "id": "AEHH*}xOD[Fi5[P-[SJ9",
                      "inputs": {
                        "inputId": {
                          "block": {
                            "type": "id_id",
                            "id": "%#|xEv0cguzG8S!`dJ9f",
                            "fields": {
                              "inputValue": "SUM"
                            }
                          }
                        },
                        "inputVar": {
                          "block": {
                            "type": "sig_signature",
                            "id": "nMenqxyW/syip^)t?vNT",
                            "inputs": {
                              "spec": {
                                "block": {
                                  "type": "spec_sequence",
                                  "id": "Ubkcexh)9%q}N#0)Ex.j",
                                  "extraState": {
                                    "itemCount": 2
                                  },
                                  "fields": {
                                    "desc1": " "
                                  },
                                  "inputs": {
                                    "ADD0": {
                                      "block": {
                                        "type": "spec_type",
                                        "id": ";a/}-+t$Z.?!Qn.@4k3e",
                                        "inputs": {
                                          "typdesc": {
                                            "block": {
                                              "type": "typdesc_single",
                                              "id": "moAla1UhFV(3j[n3Wj8a",
                                              "fields": {
                                                "chkSub": false
                                              },
                                              "inputs": {
                                                "inputId": {
                                                  "block": {
                                                    "type": "id_id",
                                                    "id": "5ZM`T*$[+xg,COA!$scg",
                                                    "fields": {
                                                      "inputValue": "t"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "ADD1": {
                                      "block": {
                                        "type": "spec_value",
                                        "id": "NDg8F#l-oaC(!QE_N?p-",
                                        "inputs": {
                                          "valdesc": {
                                            "block": {
                                              "type": "valdesc_single",
                                              "id": "~5cqgG~r%|?}kZJmbmNi",
                                              "inputs": {
                                                "inputId": {
                                                  "block": {
                                                    "type": "id_id",
                                                    "id": "ZPsvnnH=UyJ!{yQgt.m5",
                                                    "fields": {
                                                      "inputValue": "sm"
                                                    }
                                                  }
                                                },
                                                "inputTyp": {
                                                  "block": {
                                                    "type": "typ_function",
                                                    "id": "f}yf|GusN@1/3XBHjll.",
                                                    "inputs": {
                                                      "from": {
                                                        "block": {
                                                          "type": "typ_tuple",
                                                          "id": "v(UOD)0$4)?pJ9^1tWVY",
                                                          "extraState": {
                                                            "itemCount": 2
                                                          },
                                                          "fields": {
                                                            "desc0": "",
                                                            "desc1": "✱ "
                                                          },
                                                          "inputs": {
                                                            "ADD0": {
                                                              "block": {
                                                                "type": "typ_constructor",
                                                                "id": "H+~B/~oi7Dt7/,4@[Zik",
                                                                "extraState": {
                                                                  "itemCount": null
                                                                },
                                                                "inputs": {
                                                                  "longid": {
                                                                    "block": {
                                                                      "type": "id_long_id",
                                                                      "id": "{1jJ_uYGpt3tzGlEGhc.",
                                                                      "extraState": {
                                                                        "itemCount": 1
                                                                      },
                                                                      "inputs": {
                                                                        "ADD0": {
                                                                          "block": {
                                                                            "type": "id_id",
                                                                            "id": "b*|2N?)qklVID4bUvZ7u",
                                                                            "fields": {
                                                                              "inputValue": "t"
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "ADD1": {
                                                              "block": {
                                                                "type": "typ_constructor",
                                                                "id": "_+s%o@?iiX9U`|j7EG`9",
                                                                "extraState": {
                                                                  "itemCount": null
                                                                },
                                                                "inputs": {
                                                                  "longid": {
                                                                    "block": {
                                                                      "type": "id_long_id",
                                                                      "id": "Fs4pB5*Z)I]:Zd4+IpEU",
                                                                      "extraState": {
                                                                        "itemCount": 1
                                                                      },
                                                                      "inputs": {
                                                                        "ADD0": {
                                                                          "block": {
                                                                            "type": "id_id",
                                                                            "id": "L_H]rAgeH!]^j):ouca|",
                                                                            "fields": {
                                                                              "inputValue": "t"
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      },
                                                      "to": {
                                                        "block": {
                                                          "type": "typ_constructor",
                                                          "id": "Zcak$rNl@WX0t(Bl+UQZ",
                                                          "extraState": {
                                                            "itemCount": null
                                                          },
                                                          "inputs": {
                                                            "longid": {
                                                              "block": {
                                                                "type": "id_long_id",
                                                                "id": "6!{0X?zya?A;370pnhSM",
                                                                "extraState": {
                                                                  "itemCount": 1
                                                                },
                                                                "inputs": {
                                                                  "ADD0": {
                                                                    "block": {
                                                                      "type": "id_id",
                                                                      "id": "u|)h9N#@d6}5nYj0uIA6",
                                                                      "fields": {
                                                                        "inputValue": "t"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "ADD1": {
              "block": {
                "type": "dec_structure",
                "id": "KL37g{^!/?*-MZi)|W[`",
                "inputs": {
                  "strbind": {
                    "block": {
                      "type": "strbind_single",
                      "id": "}qT2u9@B)ul7ib,*xe|m",
                      "fields": {
                        "chkSub": true,
                        "greatherSign": ""
                      },
                      "inputs": {
                        "id": {
                          "block": {
                            "type": "id_id",
                            "id": "%R9j2WXP88#-r/Ubs3_D",
                            "fields": {
                              "inputValue": "IntSum"
                            }
                          }
                        },
                        "inputSig": {
                          "block": {
                            "type": "sig_id",
                            "id": "J;%,DtEQdHX}DV`XUnpa",
                            "inputs": {
                              "id": {
                                "block": {
                                  "type": "id_id",
                                  "id": "2a[I^li_4[Fu|N?Dn0hY",
                                  "fields": {
                                    "inputValue": "SUM"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "inputStr": {
                          "block": {
                            "type": "str_structure",
                            "id": ")F1qv+z!WO1Fz!::?O]=",
                            "inputs": {
                              "dec": {
                                "block": {
                                  "type": "dec_sequence",
                                  "id": "=UQ6Df{OhPg+2;UG),=W",
                                  "extraState": {
                                    "itemCount": 2
                                  },
                                  "inputs": {
                                    "ADD0": {
                                      "block": {
                                        "type": "dec_type",
                                        "id": "gab7E.y/o:;PQJ3Ski|]",
                                        "inputs": {
                                          "typbind": {
                                            "block": {
                                              "type": "typbind",
                                              "id": "X);I@c#B2k$7l0CGw!.V",
                                              "fields": {
                                                "chkTyp": false
                                              },
                                              "inputs": {
                                                "id": {
                                                  "block": {
                                                    "type": "id_id",
                                                    "id": "uRZB~6vwRT9Bud,wv.fT",
                                                    "fields": {
                                                      "inputValue": "t"
                                                    }
                                                  }
                                                },
                                                "inTyp": {
                                                  "block": {
                                                    "type": "typ_primtv",
                                                    "id": "!;`CuG#9y5b}X]85[f8B",
                                                    "fields": {
                                                      "type": "int"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "ADD1": {
                                      "block": {
                                        "type": "dec_val",
                                        "id": "DK{q9)6,V:l@iz|EF+:d",
                                        "extraState": {
                                          "itemCount": 1
                                        },
                                        "fields": {
                                          "chkTyp": false
                                        },
                                        "inputs": {
                                          "ADD0": {
                                            "block": {
                                              "type": "valbind",
                                              "id": "|=E~uKBc`q8|*TCh)j/_",
                                              "fields": {
                                                "recVal": ""
                                              },
                                              "inputs": {
                                                "pat": {
                                                  "block": {
                                                    "type": "pat_id",
                                                    "id": "bzM;:3`Q+=0]bi$u78~_",
                                                    "fields": {
                                                      "OP": "nothing"
                                                    },
                                                    "inputs": {
                                                      "id": {
                                                        "block": {
                                                          "type": "id_id",
                                                          "id": "cY]2UaK}@_j2lcL;LIcl",
                                                          "fields": {
                                                            "inputValue": "sm"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                "exp": {
                                                  "block": {
                                                    "type": "exp_fn",
                                                    "id": "6pqgf=:C3*=xX],|sDmb",
                                                    "inputs": {
                                                      "fn": {
                                                        "block": {
                                                          "type": "match",
                                                          "id": ",~cu8yaI/!.}g-nt@Pbn",
                                                          "inputs": {
                                                            "pat": {
                                                              "block": {
                                                                "type": "pat_tuple",
                                                                "id": "U%,W$dvZ(h0UiU-,Wwm]",
                                                                "extraState": {
                                                                  "itemCount": 2
                                                                },
                                                                "inputs": {
                                                                  "ADD0": {
                                                                    "block": {
                                                                      "type": "pat_id",
                                                                      "id": ")QhR#_Qy+dHahE{kx:5v",
                                                                      "fields": {
                                                                        "OP": "nothing"
                                                                      },
                                                                      "inputs": {
                                                                        "id": {
                                                                          "block": {
                                                                            "type": "id_id",
                                                                            "id": "~CMgHKjCc4pZ/6P=ZGMj",
                                                                            "fields": {
                                                                              "inputValue": "a"
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  },
                                                                  "ADD1": {
                                                                    "block": {
                                                                      "type": "pat_id",
                                                                      "id": "!$nLysgrc+j^FGx7nZNi",
                                                                      "fields": {
                                                                        "OP": "nothing"
                                                                      },
                                                                      "inputs": {
                                                                        "id": {
                                                                          "block": {
                                                                            "type": "id_id",
                                                                            "id": "#z)m*fVBh8i|(!h+2z.r",
                                                                            "fields": {
                                                                              "inputValue": "b"
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "exp": {
                                                              "block": {
                                                                "type": "exp_primtv_optr_arith",
                                                                "id": ";iKOBPqWwR!_hCJ5$ZP~",
                                                                "fields": {
                                                                  "opt": "+"
                                                                },
                                                                "inputs": {
                                                                  "exp_1": {
                                                                    "block": {
                                                                      "type": "exp_bound",
                                                                      "id": "Fu=~JOr~gE9/?1BZ~%9z",
                                                                      "fields": {
                                                                        "opt": "NON_OP"
                                                                      },
                                                                      "inputs": {
                                                                        "longid": {
                                                                          "block": {
                                                                            "type": "id_long_id",
                                                                            "id": "%(n79MPMpYZ:VBJb;7J.",
                                                                            "extraState": {
                                                                              "itemCount": 1
                                                                            },
                                                                            "inputs": {
                                                                              "ADD0": {
                                                                                "block": {
                                                                                  "type": "id_id",
                                                                                  "id": "+qYE;PAP!Q4+v+6^0W,R",
                                                                                  "fields": {
                                                                                    "inputValue": "a"
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  },
                                                                  "exp_2": {
                                                                    "block": {
                                                                      "type": "exp_bound",
                                                                      "id": "7(?g^#{E?qua6I!-hfn!",
                                                                      "fields": {
                                                                        "opt": "NON_OP"
                                                                      },
                                                                      "inputs": {
                                                                        "longid": {
                                                                          "block": {
                                                                            "type": "id_long_id",
                                                                            "id": "0K=1zlK[;9zedb)7K%PH",
                                                                            "extraState": {
                                                                              "itemCount": 1
                                                                            },
                                                                            "inputs": {
                                                                              "ADD0": {
                                                                                "block": {
                                                                                  "type": "id_id",
                                                                                  "id": "n;LoBB`q+?G#iSjYI5qT",
                                                                                  "fields": {
                                                                                    "inputValue": "b"
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  }
};

/** The raw sample workspace states (exposed for the round-trip tests). */
export const sampleWorkspaces: Record<string, any> = samples;

/**
 * Load a built-in example program into the main workspace.
 * Uses Blockly's JSON serializer. When the workspace already contains
 * blocks the user is asked whether to override (clear first) or merge (append).
 * @param sampleName The key of the sample to load.
 */
export function sampleLoader(sampleName: string) {
  const state = samples[sampleName] ?? samples["signatureNStructure"];
  const ws = Blockly.getMainWorkspace();
  const count = ws.getAllBlocks(false).length;
  if (count && confirm("Ok to override, or\nCancel will merge?")) {
    ws.clear();
    Blockly.serialization.workspaces.load(state, ws);
  } else if (!count) {
    Blockly.serialization.workspaces.load(state, ws);
  } else {
    // Merge: append the sample blocks without clearing existing ones.
    const blocks = (state && state.blocks && state.blocks.blocks) || [];
    for (const b of blocks) Blockly.serialization.blocks.append(b, ws);
  }
}
