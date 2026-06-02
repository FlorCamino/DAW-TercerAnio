import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

const ACCENTED_CHARS = 'áàäâãéèëêíìïîóòöôõúùüûñç';
const NORMAL_CHARS = 'aaaaaeeeeiiiiooooouuuunc';

export function addAccentInsensitiveLike<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  column: string,
  parameterName: string,
  value: string,
): void {
  query.andWhere(
    `translate(lower(${column}), :accentedChars, :normalChars) LIKE translate(lower(:${parameterName}), :accentedChars, :normalChars)`,
    {
      accentedChars: ACCENTED_CHARS,
      normalChars: NORMAL_CHARS,
      [parameterName]: `%${value}%`,
    },
  );
}
