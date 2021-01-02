const CURRENCY_TABLE = {
    "Default": "DEFAULT",

    // Platforms
    "Caffeine Credits": "CAFFEINE_CREDITS",
    "Twitch Bits": "TWITCH_BITS",

    // Popular (?)
    "US Dollar (USD)": "USD",
    "Canadian Dollar (CAD)": "CAD",
    "British Pound (GBP)": "GBP",
    "Australian Dollar (AUD)": "AUD",
    "Euro (EUR)": "EUR",

    // All (No I did not type this by hand)
    "United Arab Emirates Dirham (AED)": "AED",
    "Afghan Afghani (AFN)": "AFN",
    "Albanian Lek (ALL)": "ALL",
    "Armenian Dram (AMD)": "AMD",
    "Netherlands Antillean Guilder (ANG)": "ANG",
    "Angolan Kwanza (AOA)": "AOA",
    "Argentine Peso (ARS)": "ARS",
    "Aruban Florin (AWG)": "AWG",
    "Azerbaijani Manat (AZN)": "AZN",
    "Bosnia-Herzegovina Convertible Mark (BAM)": "BAM",
    "Barbadian Dollar (BBD)": "BBD",
    "Bangladeshi Taka (BDT)": "BDT",
    "Bulgarian Lev (BGN)": "BGN",
    "Bahraini Dinar (BHD)": "BHD",
    "Burundian Franc (BIF)": "BIF",
    "Bermudan Dollar (BMD)": "BMD",
    "Brunei Dollar (BND)": "BND",
    "Bolivian Boliviano (BOB)": "BOB",
    "Bolivian Mvdol (BOV)": "BOV",
    "Brazilian Real (BRL)": "BRL",
    "Bahamian Dollar (BSD)": "BSD",
    "Bhutanese Ngultrum (BTN)": "BTN",
    "Botswanan Pula (BWP)": "BWP",
    "Belarusian Ruble (BYN)": "BYN",
    "Belize Dollar (BZD)": "BZD",
    "Congolese Franc (CDF)": "CDF",
    "WIR Euro (CHE)": "CHE",
    "Swiss Franc (CHF)": "CHF",
    "WIR Franc (CHW)": "CHW",
    "Chilean Unit of Account (UF) (CLF)": "CLF",
    "Chilean Peso (CLP)": "CLP",
    "Chinese Yuan (offshore) (CNH)": "CNH",
    "Chinese Yuan (CNY)": "CNY",
    "Colombian Peso (COP)": "COP",
    "Colombian Real Value Unit (COU)": "COU",
    "Costa Rican Colón (CRC)": "CRC",
    "Cuban Convertible Peso (CUC)": "CUC",
    "Cuban Peso (CUP)": "CUP",
    "Cape Verdean Escudo (CVE)": "CVE",
    "Czech Koruna (CZK)": "CZK",
    "Djiboutian Franc (DJF)": "DJF",
    "Danish Krone (DKK)": "DKK",
    "Dominican Peso (DOP)": "DOP",
    "Algerian Dinar (DZD)": "DZD",
    "Egyptian Pound (EGP)": "EGP",
    "Eritrean Nakfa (ERN)": "ERN",
    "Ethiopian Birr (ETB)": "ETB",
    "Fijian Dollar (FJD)": "FJD",
    "Falkland Islands Pound (FKP)": "FKP",
    "Georgian Lari (GEL)": "GEL",
    "Ghanaian Cedi (GHS)": "GHS",
    "Gibraltar Pound (GIP)": "GIP",
    "Gambian Dalasi (GMD)": "GMD",
    "Guinean Franc (GNF)": "GNF",
    "Guatemalan Quetzal (GTQ)": "GTQ",
    "Guyanaese Dollar (GYD)": "GYD",
    "Hong Kong Dollar (HKD)": "HKD",
    "Honduran Lempira (HNL)": "HNL",
    "Croatian Kuna (HRK)": "HRK",
    "Haitian Gourde (HTG)": "HTG",
    "Hungarian Forint (HUF)": "HUF",
    "Indonesian Rupiah (IDR)": "IDR",
    "Israeli New Shekel (ILS)": "ILS",
    "Indian Rupee (INR)": "INR",
    "Iraqi Dinar (IQD)": "IQD",
    "Iranian Rial (IRR)": "IRR",
    "Icelandic Króna (ISK)": "ISK",
    "Jamaican Dollar (JMD)": "JMD",
    "Jordanian Dinar (JOD)": "JOD",
    "Japanese Yen (JPY)": "JPY",
    "Kenyan Shilling (KES)": "KES",
    "Kyrgystani Som (KGS)": "KGS",
    "Cambodian Riel (KHR)": "KHR",
    "Comorian Franc (KMF)": "KMF",
    "North Korean Won (KPW)": "KPW",
    "South Korean Won (KRW)": "KRW",
    "Kuwaiti Dinar (KWD)": "KWD",
    "Cayman Islands Dollar (KYD)": "KYD",
    "Kazakhstani Tenge (KZT)": "KZT",
    "Laotian Kip (LAK)": "LAK",
    "Lebanese Pound (LBP)": "LBP",
    "Sri Lankan Rupee (LKR)": "LKR",
    "Liberian Dollar (LRD)": "LRD",
    "Lesotho Loti (LSL)": "LSL",
    "Libyan Dinar (LYD)": "LYD",
    "Moroccan Dirham (MAD)": "MAD",
    "Moldovan Leu (MDL)": "MDL",
    "Malagasy Ariary (MGA)": "MGA",
    "Macedonian Denar (MKD)": "MKD",
    "Myanmar Kyat (MMK)": "MMK",
    "Mongolian Tugrik (MNT)": "MNT",
    "Macanese Pataca (MOP)": "MOP",
    "Mauritanian Ouguiya (MRO)": "MRO",
    "Mauritian Rupee (MUR)": "MUR",
    "Malawian Kwacha (MWK)": "MWK",
    "Mexican Peso (MXN)": "MXN",
    "Mexican Investment Unit (MXV)": "MXV",
    "Malaysian Ringgit (MYR)": "MYR",
    "Mozambican Metical (MZN)": "MZN",
    "Namibian Dollar (NAD)": "NAD",
    "Nigerian Naira (NGN)": "NGN",
    "Nicaraguan Córdoba (NIO)": "NIO",
    "Norwegian Krone (NOK)": "NOK",
    "Nepalese Rupee (NPR)": "NPR",
    "New Zealand Dollar (NZD)": "NZD",
    "Omani Rial (OMR)": "OMR",
    "Panamanian Balboa (PAB)": "PAB",
    "Peruvian Sol (PEN)": "PEN",
    "Papua New Guinean Kina (PGK)": "PGK",
    "Philippine Piso (PHP)": "PHP",
    "Pakistani Rupee (PKR)": "PKR",
    "Polish Zloty (PLN)": "PLN",
    "Paraguayan Guarani (PYG)": "PYG",
    "Qatari Rial (QAR)": "QAR",
    "Romanian Leu (RON)": "RON",
    "Serbian Dinar (RSD)": "RSD",
    "Russian Ruble (RUB)": "RUB",
    "Rwandan Franc (RWF)": "RWF",
    "Saudi Riyal (SAR)": "SAR",
    "Solomon Islands Dollar (SBD)": "SBD",
    "Seychellois Rupee (SCR)": "SCR",
    "Sudanese Pound (SDG)": "SDG",
    "Swedish Krona (SEK)": "SEK",
    "Singapore Dollar (SGD)": "SGD",
    "St. Helena Pound (SHP)": "SHP",
    "Sierra Leonean Leone (SLL)": "SLL",
    "Somali Shilling (SOS)": "SOS",
    "Surinamese Dollar (SRD)": "SRD",
    "South Sudanese Pound (SSP)": "SSP",
    "São Tomé & Príncipe Dobra (2018) (STN)": "STN",
    "Syrian Pound (SYP)": "SYP",
    "Swazi Lilangeni (SZL)": "SZL",
    "Thai Baht (THB)": "THB",
    "Tajikistani Somoni (TJS)": "TJS",
    "Tunisian Dinar (TND)": "TND",
    "Tongan Paʻanga (TOP)": "TOP",
    "Turkish Lira (TRY)": "TRY",
    "Trinidad & Tobago Dollar (TTD)": "TTD",
    "New Taiwan Dollar (TWD)": "TWD",
    "Tanzanian Shilling (TZS)": "TZS",
    "Ukrainian Hryvnia (UAH)": "UAH",
    "Ugandan Shilling (UGX)": "UGX",
    "Uruguayan Peso (Indexed Units) (UYI)": "UYI",
    "Uruguayan Peso (UYU)": "UYU",
    "Uzbekistani Som (UZS)": "UZS",
    "Venezuelan Bolívar (VEF)": "VEF",
    "Vietnamese Dong (VND)": "VND",
    "Vanuatu Vatu (VUV)": "VUV",
    "Samoan Tala (WST)": "WST",
    "Central African CFA Franc (XAF)": "XAF",
    "East Caribbean Dollar (XCD)": "XCD",
    "West African CFA Franc (XOF)": "XOF",
    "CFP Franc (XPF)": "XPF",
    "Yemeni Rial (YER)": "YER",
    "South African Rand (ZAR)": "ZAR",
    "Zambian Kwacha (ZMW)": "ZMW"
};

const CURRENCIES = [];
const CURRENCY_TABLE_INVERTED = {};
const PSUEDO_CURRENCIES = ["CAFFEINE_CREDITS", "TWITCH_BITS", "DEFAULT"];

Object.entries(CURRENCY_TABLE).forEach((currency) => {
    CURRENCY_TABLE_INVERTED[currency[1]] = currency[0];
    CURRENCIES.push(currency[0]);
});

function formatCurrency(amount, currency) {
    amount = parseFloat(amount);

    if (currency == "DEFAULT") {
        currency = "USD";
    }

    if (currency === "CAFFEINE_CREDITS") {
        return `
            <span>
                <svg viewBox="0 0 16 16" fill="#C6F" style="height: .8em; width: auto; transform: translateY(.075em);">
                    <g fill-rule="evenodd">
                        <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 .667a7.333 7.333 0 100 14.666A7.333 7.333 0 008 .667z"></path>
                        <circle cx="8" cy="8" r="6"></circle>
                    </g>
                </svg>
                ${amount.toFixed(0)}
            </span>
        `;
    } else if (currency === "TWITCH_BITS") {
        let color;

        // https://assets.help.twitch.tv/article/img/2449458-01.gif
        if (amount >= 10000) {
            color = "red";
        } else if (amount >= 5000) {
            color = "blue";
        } else if (amount >= 1000) {
            color = "green";
        } else if (amount >= 100) {
            color = "purple";
        } else {
            color = "gray";
        }

        return `
            <span>
                <img style="display: inline-block; height: 1em; width: auto; transform: translateY(.1em);" src="https://static-cdn.jtvnw.net/bits/dark/animated/${color}/4" />
                ${amount.toFixed(0)}
            </span>
        `;
    } else {
        const formatter = new Intl.NumberFormat(navigator.languages[0], {
            style: "currency",
            currency: currency,
        });

        let parts = formatter.formatToParts(amount);

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // Remove fraction and (optionally) decimal if there are traling 0's
            if (part.type === "fraction") {
                if (part.value.match(/^0*$/)) {
                    parts.splice(i, 1);

                    if (parts[i - 1] && (parts[i - 1].type === "decimal")) {
                        parts.splice(i - 1);
                    }
                }

                break;
            }
        }

        let joined = "";

        parts.forEach((part) => {
            joined = joined + part.value;
        });

        return `<span>${joined}</span>`;
    }
}

async function convertAndFormatCurrency(amount, from, to) {
    if (to.toUpperCase() === "DEFAULT") to = from;

    const result = await convertCurrency(amount, from, to);

    return formatCurrency(result, to);
}

async function convertCurrency(amount, from, to) {
    if (to.toUpperCase() === "DEFAULT") {
        return amount;
    } else {
        let result;
        let usd;

        if (from === "CAFFEINE_CREDITS") {
            usd = amount / 91; // Something we figured out, no official source for this though.
        } else if (from === "TWITCH_BITS") {
            usd = amount / 100; // https://twitchbitstousd.com/
        } else {
            usd = await CurrencyConverter(amount, from, "USD");
        }

        if (to === "CAFFEINE_CREDITS") {
            result = usd * 91; // Something we figured out, no official source for this though.
        } else if (to === "TWITCH_BITS") {
            result = usd * 100; // https://twitchbitstousd.com/
        } else {
            result = await CurrencyConverter(usd, "USD", to);
        }

        return result;
    }
}
