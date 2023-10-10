const { parens, varid_pattern } = require('./util.js')

module.exports = {
  // ------------------------------------------------------------------------
  // Identifiers
  // ------------------------------------------------------------------------

  _varid:              _ => varid_pattern,
  _immediate_varid:    _ => token.immediate(varid_pattern),
  variable:            $ => $._varid,
  _immediate_variable: $ => alias($._immediate_varid, $.variable),
  qualified_variable:  $ => qualified($, $.variable),
  _qvarid:             $ => choice($.qualified_variable, $.variable),

  // `_varsym` comes from the scanner.
  operator:            $ => $._varsym,
  _minus:              $ => alias('-', $.operator),

  // Any operator including `-`.
  _operator_or_minus:  $ => choice($.operator, $._minus),
  qualified_operator:  $ => qualified($, $._operator_or_minus),

  // Qualified or unqualified operator, with and without `-`.
  _q_op:               $ => prec(1, choice($.qualified_operator, $._operator_or_minus)),
  _q_op_nominus:       $ => choice($.qualified_operator, $.operator),

  // Qualified and unqualified identifier or operator in parens.
  _var:                $ => choice($.variable, parens($._operator_or_minus)),
  _qvar:               $ => choice($._qvarid, parens($._q_op)),

  // ------------------------------------------------------------------------
  // Data constructors
  // ------------------------------------------------------------------------

  // Data constructor.
  // Same as the varid pattern except this one would have to start with a capital letter.
  _conid:                         _ => /[\p{Lu}_][\p{L}0-9_']*/u,
  constructor:                    $ => $._conid,

  // Qualified data constructor.
  qualified_constructor:          $ => qualified($, $.constructor),
  // Qualified or unqualified data constructor.
  _qconid:                        $ => choice($.qualified_constructor, $.constructor),

  // `_consym` comes from the scanner.
  constructor_operator:           $ => $._consym,
  qualified_constructor_operator: $ => qualified($, $.constructor_operator),
  _qconsym:                       $ => choice($.qualified_constructor_operator, $.constructor_operator),

  // Data constructor in "normal" or infix operator form (in parens).
  _con:                           $ => choice($.constructor, parens($.constructor_operator)),
  // Qualified data constructor in "normal" or infix operator form (in parens).
  _qcon:                          $ => choice($._qconid, parens($._qconsym)),

  con_list: _ => brackets(),

  literal: $ => $._literal,

  // ------------------------------------------------------------------------
  // Type constructors
  // ------------------------------------------------------------------------

  _tyconid:       $ => alias($.constructor, $.type),
  qualified_type: $ => qualified($, $._tyconid),
  _qtyconid:      $ => choice($.qualified_type, $._tyconid),

  // _tyconsym here comes from the scanner
  _type_operator: $ => choice(alias($._tyconsym, $.type_operator), $.constructor_operator),
  qualified_type_operator: $ => qualified($, alias($._tyconsym, $.type_operator)),

  _qualified_type_operator: $ => choice($.qualified_type_operator, $.qualified_constructor_operator),
  _qtyconsym: $ => choice($._qualified_type_operator, $._type_operator),

  _simple_tycon: $ => choice($._tyconid, parens($._type_operator)),
  _simple_qtyconop: $ => choice($._qtyconid, parens($._qtyconsym)),

  tycon_arrow: $ => parens($._arrow),

  // TODO: Should `True` and `False` be considered literals?
  // Technically one could overwrite them, it's not baked in syntax
  type_literal: $ => choice(
    $.integer,
    $.string,
    $.triple_quote_string
  ),

  _qtycon: $ => choice($._qtyconid, parens($._qtyconsym)),

  _gtycon: $ => choice(
    $._qtycon,
    $.tycon_arrow,
  ),

  _name: $ => choice($._var, $._con),
  _qname: $ => choice($._qvar, $._qcon),
}
