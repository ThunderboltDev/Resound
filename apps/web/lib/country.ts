import * as ct from "countries-and-timezones";

export function getCountryFromTimezone(timezone?: string) {
  if (!timezone) {
    return null;
  }

  const timezoneInfo = ct.getTimezone(timezone);

  if (!timezoneInfo?.countries?.length) {
    return null;
  }

  const countryCode = timezoneInfo.countries[0];
  const country = ct.getCountry(countryCode);

  return {
    code: countryCode,
    name: country.name,
  };
}

export function getCountryFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
}
