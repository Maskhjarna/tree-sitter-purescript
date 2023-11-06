decimals1 = /[1-9][0-9_]*/
exponent = /e[+-]?[1-9_]+/

module.exports = {
  // ------------------------------------------------------------------------
  // literals
  // ------------------------------------------------------------------------

  // the `choice` here is necessary to avoid integers being parsed as numbers
  number: _ => token(
    seq(
      decimals1,
      choice(
        seq(/\.[0-9][0-9_]*/, optional(exponent)),
        exponent,
      ),
    ),
  ),

  char: _ => token(
    choice(
      /'[^']'/,
      /'\\[^ ]*'/,
    ),
  ),

  string: _ => token(
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

  triple_quote_string: _ => token(
    seq(
      '"""',
      repeat(/[^"""]*/),
      '"""',
    ),
  ),

  _integer_literal: _ => token(decimals1),
  _hex_literal: _ => token(/0x[0-9a-fA-F_]+/),

  integer: $ => choice(
    $._integer_literal,
    $._hex_literal,
  ),

  _stringly: $ => choice(
    $.string,
    $.triple_quote_string,
    $.char,
  ),

  _numeric: $ => choice(
    $.integer,
    $.number,
  ),

  _literal: $ => choice(
    $._stringly,
    $._numeric,
  ),

  _carrow: _ => choice('⇒', '=>'),

  _arrow: _ => choice('→', '->'),

  _larrow: _ => choice('←', '<-'),

  _colon2: _ => choice('∷', '::'),

  wildcard: _ => '_',

  /**
   * Field projection dot-syntax requires the dot to follow a varid without any whitespace.
   */
  _immediate_dot: _ => token.immediate('.'),
}
