const {parens} = require('./util.js')

module.exports = {
  // ------------------------------------------------------------------------
  // type
  // ------------------------------------------------------------------------

  type_variable: $ => $._varid,

  annotated_type_variable: $ => seq($.type_variable, $._type_annotation),

  _tyvar: $ => choice(
    parens($.annotated_type_variable),
    $.type_variable,
  ),

  inferred_type_variable: $ => braces(choice($.annotated_type_variable, $.type_variable)),

  _quantifier: $ => choice(
    $._tyvar,
    $.inferred_type_variable,
  ),

  _forall_kw: _ => choice('forall', '∀'),

  _forall_dot: $ => choice('.', $._arrow),

  _forall: $ => seq(
    $._forall_kw,
    repeat1($._quantifier),
  ),

  _quantifiers: $ => seq(
    $._forall,
    $._forall_dot,
  ),

  forall: $ => $._quantifiers,

  type_parens: $ => parens($._type_or_implicit),

  _type_sum: $ => sep2('|', $._type_or_implicit),
  
  _type_promotable_literal: $ => $.type_literal,

  _type_promoted_literal: $ => seq(quote, $._type_promotable_literal),

  _type_literal: $ => choice(
    alias($._type_promoted_literal, $.promoted),
    $._type_promotable_literal,
  ),

  type_name: $ => choice(
    $._tyvar,
    $._gtycon,
  ),

  type_star: _ => choice('*', '★'),

  // TODO: this kitchen-sink bag hurts the rest of the code by disregarding context and introducing ambiguity.
  // should be removed in favor of local, more specific definitions.
  _atype: $ => choice(
    $.type_name,
    $.type_star,
    $._type_literal,
    $.type_parens,
    $.row_type,
    $.record_type_literal,
  ),

  type_invisible: $ => seq('@', $._atype),

  /**
   * Type application, as in `Either e (Int, Text)` or `TypeRep @Int`.
   */
  type_apply: $ => seq($._atype, repeat1(choice($._atype, $.type_invisible))),

  /**
   * The point of this `choice` is to get a node for type application only if there is more than one atype present.
   */
  _btype: $ => choice(
    $._atype,
    $.type_apply,
  ),

  implicit_param: $ => seq(
    $._type_annotation,
  ),

  type_infix: $ => seq(
    field('left', $._btype),
    field('op', $._qtyconsym),
    field('right', $._type_infix),
  ),

  _type_infix: $ => choice(
    $.type_infix,
    $._btype,
  ),

  constraint: $ => choice(
    seq(field('class', alias($.type_name, $.class_name)), repeat($._atype)),
    $.type_infix,
  ),

  _quantified_constraint: $ => seq($._quantifiers, $._constraint),

  _constraint_context: $ => seq($._context, $._constraint),

  _constraint: $ => choice(
    alias($._quantified_constraint, $.forall),
    alias($._constraint_context, $.context),
    parens($._constraint),
    $.constraint,
  ),

  _context_constraints: $ => seq(
    choice(
      $.constraint,
      parens(optional(sep1($.comma, choice($._constraint, $.implicit_param)))),
    ),
  ),

  _context: $ => seq($._context_constraints, $._carrow),

  context: $ => $._context,

  _type_quantifiers: $ => seq($._quantifiers, $._type),

  _type_context: $ => seq($._context, $._type),

  modifier: $ => seq('%', $._atype),

  _fun_arrow: $ => seq(
    optional($.modifier),
    $._arrow,
  ),

  _type_fun: $ => prec('function-type', seq($._type_infix, $._fun_arrow, $._type)),

  _type: $ => prec('type', choice(
    alias($._type_quantifiers, $.forall),
    alias($._type_context, $.context),
    alias($._type_fun, $.fun),
    $._type_infix,
  )),

  _type_or_implicit: $ => choice(
    $.implicit_param,
    $._type,
  ),

  _type_annotation: $ => seq(
    $._colon2,
    field('type', $._type_or_implicit),
  ),

  _type_with_kind: $ => seq($._type , optional($._type_annotation)),

  _simpletype_infix: $ => seq(
    $._tyvar,
    field('name', $._type_operator),
    $._tyvar,
  ),

  _simpletype: $ => choice(
    parens($._simpletype),
    alias($._simpletype_infix, $.type_infix),
    seq(
      field('name', $._simple_tycon),
      repeat($._tyvar),
    ),
  ),

  _tyinst: $ => seq(
    repeat(choice($._atype, $.type_invisible)),
    '=',
    $._type,
  ),

  // ------------------------------------------------------------------------
  // type decl
  // ------------------------------------------------------------------------

  decl_type: $ => seq(
    'type',
    $._simpletype,
    '=',
    $._type,
  ),

}
