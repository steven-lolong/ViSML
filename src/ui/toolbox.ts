import getColorByType from "../core/seeds/color_definition";
export let toolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Program",
      colour: getColorByType("program"),
      contents: [
        {
          kind: "block",
          type: "program_functor",
        },
        {
          kind: "block",
          type: "fctbind_plain",
        },
        {
          kind: "block",
          type: "fctbind_opened",
        },
        {
          kind: "block",
          type: "fctbind_nested",
        },
        {
          kind: "block",
          type: "program_signature",
        },
        {
          kind: "block",
          type: "sigbind_single",
        },
        {
          kind: "block",
          type: "sigbind_nested",
        },
      ],
    },
    {
      kind: "category",
      name: "Constant",
      colour: getColorByType("constant"),
      contents: [
        {
          kind: "block",
          type: "con_int",
        },
        {
          kind: "block",
          type: "con_string",
        },
        {
          kind: "block",
          type: "con_char",
        },
        {
          kind: "block",
          type: "con_float",
        },
        {
          kind: "block",
          type: "con_word",
        },
      ],
    },
    {
      kind: "category",
      name: "Identitfiers",
      colour: getColorByType("identifier"),
      contents: [
        {
          kind: "block",
          type: "id_id",
        },
        {
          kind: "block",
          type: "id_long_id",
        },
        {
          kind: "block",
          type: "id_var",
        },
        {
          kind: "block",
          type: "id_long_var",
        },
        {
          kind: "block",
          type: "id_lab",
        },
      ],
    },
    {
      kind: "category",
      name: "Expression",
      colour: getColorByType("expression"),
      expanded: "true",
      contents: [
        {
          kind: "block",
          type: "exp_bound",
        },
        {
          kind: "block",
          type: "exp_application",
        },
        {
          kind: "block",
          type: "exp_infix_application",
        },
        {
          kind: "block",
          type: "exp_sequence",
        },
        {
          kind: "block",
          type: "exp_parentheses",
        },
        {
          kind: "block",
          type: "exp_let_in_end",
        },
        {
          kind: "block",
          type: "exp_with_type",
        },
        {
          kind: "block",
          type: "exp_raise",
        },
        {
          kind: "block",
          type: "exp_handle",
        },
        {
          kind: "block",
          type: "exp_andalso",
        },
        {
          kind: "block",
          type: "exp_orelse",
        },
        {
          kind: "block",
          type: "exp_if_else",
        },
        {
          kind: "block",
          type: "exp_while_do",
        },
        {
          kind: "category",
          name: "Lambda & Case",
          colour: getColorByType('expression'),
          contents: [
            {
              kind: "block",
              type: "exp_fn",
            },
            {
              kind: "block",
              type: "exp_case",
            },
            {
              kind: "block",
              type: "match",
            },
            {
              kind: "block",
              type: "matchs",
            },
          ],
        },

        {
          kind: "category",
          name: "List",
          colour: getColorByType('expression'),
          contents: [
            {
              kind: "block",
              type: "exp_list",
            },
          ],
        },
        {
          kind: "category",
          name: "Tuple",
          colour: getColorByType('expression'),
          contents: [
            {
              kind: "block",
              type: "exp_tuple",
            },
          ],
        },
        {
          kind: "category",
          name: "Record",
          colour: getColorByType('expression'),
          contents: [
            {
              kind: "block",
              type: "exp_record",
            },
            {
              kind: "block",
              type: "exprow",
            },
          ],
        },
      ],
    },
    {
      kind: "category",
      name: "Pattern",
      colour: getColorByType('pattern'),
      expanded: "true",
      contents: [
        {
          kind: "block",
          type: "pat_wildcard",
        },
        {
          kind: "block",
          type: "pat_id",
        },
        {
          kind: "block",
          type: "pat_long_id",
        },
        {
          kind: "block",
          type: "pat_infix",
        },
        {
          kind: "block",
          type: "pat_parentheses",
        },
        {
          kind: "block",
          type: "pat_type_annotation",
        },
        {
          kind: "block",
          type: "pat_layered",
        },
        {
          kind: "category",
          name: "Record",
          colour: getColorByType('pattern'),
          contents: [
            {
              kind: "block",
              type: "pat_record",
            },
            {
              kind: "block",
              type: "patrow_wildcard",
            },
            {
              kind: "block",
              type: "patrow_lab_pat",
            },
            {
              kind: "block",
              type: "patrow_variable",
            },
          ],
        },
        {
          kind: "category",
          name: "Tuple",
          colour: getColorByType('pattern'),
          contents: [
            {
              kind: "block",
              type: "pat_tuple",
            },
          ],
        },
        {
          kind: "category",
          name: "List",
          colour: getColorByType('pattern'),
          contents: [
            {
              kind: "block",
              type: "pat_list",
            },
          ],
        },
      ],
    },
    {
      kind: "category",
      name: "Type",
      colour: getColorByType('type'),
      expanded: "true",
      contents: [
        {
          kind: "block",
          type: "typ_var",
        },
        {
          kind: "block",
          type: "typ_constructor",
        },
        {
          kind: "block",
          type: "typ_parentheses",
        },
        {
          kind: "block",
          type: "typ_function",
        },
        {
          kind: "block",
          type: "typ_primtv",
        },
        {
          kind: "category",
          name: "List",
          colour: getColorByType('type'),
          contents: [
            {
              kind: "block",
              type: "typ_list",
            },
          ],
        },
        {
          kind: "category",
          name: "Tuple",
          colour: getColorByType('type'),
          contents: [
            {
              kind: "block",
              type: "typ_tuple",
            },
          ],
        },
        {
          kind: "category",
          name: "Record",
          colour: getColorByType('type'),
          contents: [
            {
              kind: "block",
              type: "typ_record",
            },
          ],
        },
      ],
    },
    {
      kind: "category",
      name: "Structure",
      colour: getColorByType('structure'),
      contents: [
        {
          kind: "block",
          type: "str_identifier",
        },
        {
          kind: "block",
          type: "str_structure",
        },
        {
          kind: "block",
          type: "str_local_declaration",
        },
        {
          kind: "block",
          type: "str_transparent_annotation",
        },
        {
          kind: "block",
          type: "str_opaque_annotation",
        },
        {
          kind: "block",
          type: "str_functor_application_str",
        },
        {
          kind: "block",
          type: "str_functor_application_dec",
        },
      ],
    },
    {
      kind: "category",
      name: "Signature",
      colour: getColorByType('signature'),
      expanded: "true",
      contents: [
        {
          kind: "block",
          type: "sig_id",
        },
        {
          kind: "block",
          type: "sig_signature",
        },
        {
          kind: "block",
          type: "sig_refinement",
        },
        {
          kind: "block",
          type: "typrefin_single",
        },
        {
          kind: "block",
          type: "typrefin_nested",
        },
        {
          kind: "category",
          name: "Specification",
          colour: getColorByType('signature'),
          expanded: "true",
          contents: [
            {
              kind: "category",
              name: "Value",
              colour: getColorByType('signature'),
              contents: [
                {
                  kind: "block",
                  type: "spec_value",
                },
                {
                  kind: "block",
                  type: "valdesc_single",
                },
                {
                  kind: "block",
                  type: "valdesc_nested",
                },
              ],
            },
            {
              kind: "category",
              name: "Type",
              colour: getColorByType('signature'),
              contents: [
                {
                  kind: "block",
                  type: "spec_type",
                },
                {
                  kind: "block",
                  type: "spec_equality_type",
                },
                {
                  kind: "block",
                  type: "spec_type_abbreviation",
                },
                {
                  kind: "block",
                  type: "typdesc_single",
                },
                {
                  kind: "block",
                  type: "typdesc_nested",
                },
              ],
            },
            {
              kind: "category",
              name: "Data type",
              colour: getColorByType('signature'),
              contents: [
                {
                  kind: "block",
                  type: "spec_datatype",
                },
                {
                  kind: "block",
                  type: "spec_datatype_replication",
                },
                {
                  kind: "block",
                  type: "datdesc_single",
                },
                {
                  kind: "block",
                  type: "datdesc_nested",
                },
                {
                  kind: "block",
                  type: "condesc_single",
                },
                {
                  kind: "block",
                  type: "condesc_nested",
                },
              ],
            },
            {
              kind: "category",
              name: "Exception",
              colour: getColorByType('signature'),
              contents: [
                {
                  kind: "block",
                  type: "spec_exception",
                },
                {
                  kind: "block",
                  type: "exndesc_single",
                },
                {
                  kind: "block",
                  type: "exndesc_nested",
                },
              ],
            },
            {
              kind: "category",
              name: "Structure",
              colour: getColorByType('signature'),
              contents: [
                {
                  kind: "block",
                  type: "spec_structure",
                },
                {
                  kind: "block",
                  type: "strdesc_single",
                },
                {
                  kind: "block",
                  type: "strdesc_nested",
                },
              ],
            },
            {
              kind: "block",
              type: "spec_sequence",
            },
            {
              kind: "block",
              type: "spec_inclusion_sig",
            },
            {
              kind: "block",
              type: "spec_inclusion",
            },
            {
              kind: "block",
              type: "spec_type_sharing",
            },
          ],
        },
      ],
    },
    {
      kind: "category",
      name: "Declaration",
      colour: getColorByType('declaration'),
      expanded: "true",
      contents: [
        {
          kind: "category",
          name: "Value (Variable)",
          colour: getColorByType('declaration'),
          contents: [
            {
              kind: "block",
              type: "dec_val",
            },
            {
              kind: "block",
              type: "valbind",
            },
            {
              kind: "block",
              type: "id_long_var",
            },
          ],
        },
        {
          kind: "category",
          name: "Function",
          colour: getColorByType('declaration'),
          contents: [
            {
              kind: "block",
              type: "dec_fun",
            },
            {
              kind: "block",
              type: "funmatch_infix",
            },
            {
              kind: "block",
              type: "funmatch_infix_n_inhabitant",
            },
            {
              kind: "block",
              type: "funmatch_nonfix",
            },
            {
              kind: "block",
              type: "funmatch_more_row",
            },
            {
              kind: "block",
              type: "id_long_var",
            },
          ],
        },
        {
          kind: "category",
          name: "Structure",
          colour: getColorByType('declaration'),
          contents: [
            {
              kind: "block",
              type: "dec_structure",
            },
            {
              kind: "block",
              type: "strbind_single",
            },
            {
              kind: "block",
              type: "strbind_nested",
            },
          ],
        },
        {
          kind: "category",
          name: "Exception",
          colour: getColorByType('declaration'),
          contents: [
            {
              kind: "block",
              type: "dec_exception",
            },
            {
              kind: "block",
              type: "exnbind",
            },
            {
              kind: "block",
              type: "exnbind_renaming",
            },
            {
              kind: "block",
              type: "exnbind_more_inhabitants",
            },
          ],
        },
        {
          kind: "category",
          name: "Data type",
          colour: getColorByType('declaration'),
          contents: [
            {
              kind: "block",
              type: "dec_type",
            },
            {
              kind: "block",
              type: "dec_datatype_replication",
            },
            {
              kind: "block",
              type: "dec_datatype_bind",
            },
            {
              kind: "block",
              type: "dec_abstype",
            },
            {
              kind: "block",
              type: "id_long_var",
            },
            {
              kind: "block",
              type: "typbind",
            },
            {
              kind: "block",
              type: "typebind_more_inhabitants",
            },
            {
              kind: "block",
              type: "datbind",
            },
            {
              kind: "block",
              type: "databind_more_inhabitants",
            },
            {
              kind: "block",
              type: "conbind",
            },
            {
              kind: "block",
              type: "conbind_more_inhabitants",
            },
          ],
        },
        {
          kind: "block",
          type: "dec_exception",
        },
        {
          kind: "block",
          type: "dec_local",
        },
        {
          kind: "block",
          type: "dec_sequence",
        },
        {
          kind: "block",
          type: "dec_open",
        },
        {
          kind: "block",
          type: "dec_nonfix",
        },
        {
          kind: "block",
          type: "dec_infix",
        },
        {
          kind: "block",
          type: "dec_infixr",
        },
      ],
    },
    {
      kind: "category",
      name: "Operator",
      colour: getColorByType('operator'),
      contents: [
        {
          kind: "block",
          type: "exp_primtv_optr_arith",
        },
        {
          kind: "block",
          type: "exp_primtv_optr_logic",
        },
        {
          kind: "block",
          type: "exp_primtv_optr_record",
        },
        {
          kind: "block",
          type: "exp_primtv_optr_list_hd",
        },
        {
          kind: "block",
          type: "exp_primtv_optr_list_tail",
        },
      ],
    },
  ],
};
