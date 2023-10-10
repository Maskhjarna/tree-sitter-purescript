decimals1 = /[0-9][0-9_]*/
exponent = /e[+-]?[0-9_]+/
magic_hash = rule => token(rule)

module.exports = {
  // ------------------------------------------------------------------------
  // literals
  // ------------------------------------------------------------------------

  // the `choice` here is necessary to avoid integers being parsed as floats
  float: _ => magic_hash(
    seq(
      decimals1,
      choice(
        seq(/\.[0-9_]+/, optional(exponent)),
        exponent,
      ),
    ),
  ),

  char: _ => magic_hash(
    choice(
      /'[^']'/,
      /'\\[^ ]*'/,
    ),
  ),

  string: _ => magic_hash(
    seq(
      '"',
      repeat(choice(
        /[^\\"\n]/,
        /\\(\^)?./,
        /\\\n\s*\\/,
      )),
      '"',
    ),
  ),

  triple_quote_string: _ => magic_hash(
    seq(
      '"""',
      repeat(/[^"""]*/),
      '"""',
    ),
  ),

  _integer_literal: _ => magic_hash(decimals1),

  _hex_literal: _ => magic_hash(/0[xX][0-9a-fA-F_]+/),

  integer: $ => choice(
    $._integer_literal,
    $._hex_literal,
  ),

  _stringly: $ => choice(
    $.string,
    $.triple_quote_string,
    $.char,
  ),

  _number: $ => choice(
    $.integer,
    $.float,
  ),

  _literal: $ => choice(
    $._stringly,
    $._number,
  ),

  _carrow: _ => choice('⇒', '=>'),
  _arrow:  _ => choice('→', '->'),
  _larrow: _ => choice('←', '<-'),
  _colon2: _ => choice('∷', '::'),

  wildcard: _ => '_',

  /**
   * Field projection dot-syntax requires the dot to follow a varid without any whitespace.
   */
  _immediate_dot: _ => token.immediate('.'),
}
