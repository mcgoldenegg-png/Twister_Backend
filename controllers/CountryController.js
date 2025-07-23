const ApiResponse = require("../utils/apiResponse");
const Continent = require("../models/Continent");
const Country = require("../models/Country");


async function seedAfrica() {
    const countries = [
        {
            "name": "Algeria",
            "emoji": "🇩🇿",
            "dial_code": "+213"
        },
        {
            "name": "Angola",
            "emoji": "🇦🇴",
            "dial_code": "+244"
        },
        {
            "name": "Benin",
            "emoji": "🇧🇯",
            "dial_code": "+229"
        },
        {
            "name": "Botswana",
            "emoji": "🇧🇼",
            "dial_code": "+267"
        },
        {
            "name": "Burkina Faso",
            "emoji": "🇧🇫",
            "dial_code": "+226"
        },
        {
            "name": "Burundi",
            "emoji": "🇧🇮",
            "dial_code": "+257"
        },
        {
            "name": "Cameroon",
            "emoji": "🇨🇲",
            "dial_code": "+237"
        },
        {
            "name": "Cape Verde",
            "emoji": "🇨🇻",
            "dial_code": "+238"
        },
        {
            "name": "Central African Republic",
            "emoji": "🇨🇫",
            "dial_code": "+236"
        },
        {
            "name": "Chad",
            "emoji": "🇹🇩",
            "dial_code": "+235"
        },
        {
            "name": "Comoros",
            "emoji": "🇰🇲",
            "dial_code": "+269"
        },
        {
            "name": "Congo - Brazzaville",
            "emoji": "🇨🇬",
            "dial_code": "+242"
        },
        {
            "name": "Congo - Kinshasa",
            "emoji": "🇨🇩",
            "dial_code": "+243"
        },
        {
            "name": "Côte d’Ivoire",
            "emoji": "🇨🇮",
            "dial_code": "+225"
        },
        {
            "name": "Djibouti",
            "emoji": "🇩🇯",
            "dial_code": "+253"
        },
        {
            "name": "Egypt",
            "emoji": "🇪🇬",
            "dial_code": "+20"
        },
        {
            "name": "Equatorial Guinea",
            "emoji": "🇬🇶",
            "dial_code": "+240"
        },
        {
            "name": "Eritrea",
            "emoji": "🇪🇷",
            "dial_code": "+291"
        },
        {
            "name": "Eswatini",
            "emoji": "🇸🇿",
            "dial_code": "+268"
        },
        {
            "name": "Ethiopia",
            "emoji": "🇪🇹",
            "dial_code": "+251"
        },
        {
            "name": "Gabon",
            "emoji": "🇬🇦",
            "dial_code": "+241"
        },
        {
            "name": "Gambia",
            "emoji": "🇬🇲",
            "dial_code": "+220"
        },
        {
            "name": "Ghana",
            "emoji": "🇬🇭",
            "dial_code": "+233"
        },
        {
            "name": "Guinea",
            "emoji": "🇬🇳",
            "dial_code": "+224"
        },
        {
            "name": "Guinea-Bissau",
            "emoji": "🇬🇼",
            "dial_code": "+245"
        },
        {
            "name": "Kenya",
            "emoji": "🇰🇪",
            "dial_code": "+254"
        },
        {
            "name": "Lesotho",
            "emoji": "🇱🇸",
            "dial_code": "+266"
        },
        {
            "name": "Liberia",
            "emoji": "🇱🇷",
            "dial_code": "+231"
        },
        {
            "name": "Libya",
            "emoji": "🇱🇾",
            "dial_code": "+218"
        },
        {
            "name": "Madagascar",
            "emoji": "🇲🇬",
            "dial_code": "+261"
        },
        {
            "name": "Malawi",
            "emoji": "🇲🇼",
            "dial_code": "+265"
        },
        {
            "name": "Mali",
            "emoji": "🇲🇱",
            "dial_code": "+223"
        },
        {
            "name": "Mauritania",
            "emoji": "🇲🇷",
            "dial_code": "+222"
        },
        {
            "name": "Mauritius",
            "emoji": "🇲🇺",
            "dial_code": "+230"
        },
        {
            "name": "Mayotte",
            "emoji": "🇾🇹",
            "dial_code": "+262"
        },
        {
            "name": "Morocco",
            "emoji": "🇲🇦",
            "dial_code": "+212"
        },
        {
            "name": "Mozambique",
            "emoji": "🇲🇿",
            "dial_code": "+258"
        },
        {
            "name": "Namibia",
            "emoji": "🇳🇦",
            "dial_code": "+264"
        },
        {
            "name": "Niger",
            "emoji": "🇳🇪",
            "dial_code": "+227"
        },
        {
            "name": "Nigeria",
            "emoji": "🇳🇬",
            "dial_code": "+234"
        },
        {
            "name": "Rwanda",
            "emoji": "🇷🇼",
            "dial_code": "+250"
        },
        {
            "name": "Réunion",
            "emoji": "🇷🇪",
            "dial_code": "+262"
        },
        {
            "name": "Senegal",
            "emoji": "🇸🇳",
            "dial_code": "+221"
        },
        {
            "name": "Seychelles",
            "emoji": "🇸🇨",
            "dial_code": "+248"
        },
        {
            "name": "Sierra Leone",
            "emoji": "🇸🇱",
            "dial_code": "+232"
        },
        {
            "name": "Somalia",
            "emoji": "🇸🇴",
            "dial_code": "+252"
        },
        {
            "name": "South Africa",
            "emoji": "🇿🇦",
            "dial_code": "+27"
        },
        {
            "name": "South Sudan",
            "emoji": "🇸🇸",
            "dial_code": "+211"
        },
        {
            "name": "Sudan",
            "emoji": "🇸🇩",
            "dial_code": "+249"
        },
        {
            "name": "São Tomé & Príncipe",
            "emoji": "🇸🇹",
            "dial_code": "+239"
        },
        {
            "name": "Tanzania",
            "emoji": "🇹🇿",
            "dial_code": "+255"
        },
        {
            "name": "Togo",
            "emoji": "🇹🇬",
            "dial_code": "+228"
        },
        {
            "name": "Tunisia",
            "emoji": "🇹🇳",
            "dial_code": "+216"
        },
        {
            "name": "Uganda",
            "emoji": "🇺🇬",
            "dial_code": "+256"
        },
        {
            "name": "Zambia",
            "emoji": "🇿🇲",
            "dial_code": "+260"
        },
        {
            "name": "Zimbabwe",
            "emoji": "🇿🇼",
            "dial_code": "+263"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 4 })));
}

async function seedAsia() {
    const countries = [
        {
            "name": "Afghanistan",
            "emoji": "🇦🇫",
            "dial_code": "+93"
        },
        {
            "name": "Armenia",
            "emoji": "🇦🇲",
            "dial_code": "+374"
        },
        {
            "name": "Azerbaijan",
            "emoji": "🇦🇿",
            "dial_code": "+994"
        },
        {
            "name": "Bahrain",
            "emoji": "🇧🇭",
            "dial_code": "+973"
        },
        {
            "name": "Bangladesh",
            "emoji": "🇧🇩",
            "dial_code": "+880"
        },
        {
            "name": "Bhutan",
            "emoji": "🇧🇹",
            "dial_code": "+975"
        },
        {
            "name": "Brunei",
            "emoji": "🇧🇳",
            "dial_code": "+673"
        },
        {
            "name": "Cambodia",
            "emoji": "🇰🇭",
            "dial_code": "+855"
        },
        {
            "name": "China",
            "emoji": "🇨🇳",
            "dial_code": "+86"
        },
        {
            "name": "Cyprus",
            "emoji": "🇨🇾",
            "dial_code": "+357"
        },
        {
            "name": "Georgia",
            "emoji": "🇬🇪",
            "dial_code": "+995"
        },
        {
            "name": "Hong Kong SAR China",
            "emoji": "🇭🇰",
            "dial_code": "+852"
        },
        {
            "name": "India",
            "emoji": "🇮🇳",
            "dial_code": "+91"
        },
        {
            "name": "Indonesia",
            "emoji": "🇮🇩",
            "dial_code": "+62"
        },
        {
            "name": "Iran",
            "emoji": "🇮🇷",
            "dial_code": "+98"
        },
        {
            "name": "Iraq",
            "emoji": "🇮🇶",
            "dial_code": "+964"
        },
        {
            "name": "Israel",
            "emoji": "🇮🇱",
            "dial_code": "+972"
        },
        {
            "name": "Japan",
            "emoji": "🇯🇵",
            "dial_code": "+81"
        },
        {
            "name": "Jordan",
            "emoji": "🇯🇴",
            "dial_code": "+962"
        },
        {
            "name": "Kazakhstan",
            "emoji": "🇰🇿",
            "dial_code": "+77"
        },
        {
            "name": "Kuwait",
            "emoji": "🇰🇼",
            "dial_code": "+965"
        },
        {
            "name": "Kyrgyzstan",
            "emoji": "🇰🇬",
            "dial_code": "+996"
        },
        {
            "name": "Laos",
            "emoji": "🇱🇦",
            "dial_code": "+856"
        },
        {
            "name": "Lebanon",
            "emoji": "🇱🇧",
            "dial_code": "+961"
        },
        {
            "name": "Macao SAR China",
            "emoji": "🇲🇴",
            "dial_code": "+853"
        },
        {
            "name": "Malaysia",
            "emoji": "🇲🇾",
            "dial_code": "+60"
        },
        {
            "name": "Maldives",
            "emoji": "🇲🇻",
            "dial_code": "+960"
        },
        {
            "name": "Mongolia",
            "emoji": "🇲🇳",
            "dial_code": "+976"
        },
        {
            "name": "Myanmar (Burma)",
            "emoji": "🇲🇲",
            "dial_code": "+95"
        },
        {
            "name": "Nepal",
            "emoji": "🇳🇵",
            "dial_code": "+977"
        },
        {
            "name": "North Korea",
            "emoji": "🇰🇵",
            "dial_code": "+850"
        },
        {
            "name": "Oman",
            "emoji": "🇴🇲",
            "dial_code": "+968"
        },
        {
            "name": "Pakistan",
            "emoji": "🇵🇰",
            "dial_code": "+92"
        },
        {
            "name": "Palestinian Territories",
            "emoji": "🇵🇸",
            "dial_code": "+970"
        },
        {
            "name": "Philippines",
            "emoji": "🇵🇭",
            "dial_code": "+63"
        },
        {
            "name": "Qatar",
            "emoji": "🇶🇦",
            "dial_code": "+974"
        },
        {
            "name": "Russia",
            "emoji": "🇷🇺",
            "dial_code": "+7"
        },
        {
            "name": "Saudi Arabia",
            "emoji": "🇸🇦",
            "dial_code": "+966"
        },
        {
            "name": "Singapore",
            "emoji": "🇸🇬",
            "dial_code": "+65"
        },
        {
            "name": "South Korea",
            "emoji": "🇰🇷",
            "dial_code": "+82"
        },
        {
            "name": "Sri Lanka",
            "emoji": "🇱🇰",
            "dial_code": "+94"
        },
        {
            "name": "Syria",
            "emoji": "🇸🇾",
            "dial_code": "+963"
        },
        {
            "name": "Taiwan",
            "emoji": "🇹🇼",
            "dial_code": "+886"
        },
        {
            "name": "Tajikistan",
            "emoji": "🇹🇯",
            "dial_code": "+992"
        },
        {
            "name": "Thailand",
            "emoji": "🇹🇭",
            "dial_code": "+66"
        },
        {
            "name": "Timor-Leste",
            "emoji": "🇹🇱",
            "dial_code": "+670"
        },
        {
            "name": "Turkey",
            "emoji": "🇹🇷",
            "dial_code": "+90"
        },
        {
            "name": "Turkmenistan",
            "emoji": "🇹🇲",
            "dial_code": "+993"
        },
        {
            "name": "United Arab Emirates",
            "emoji": "🇦🇪",
            "dial_code": "+971"
        },
        {
            "name": "Uzbekistan",
            "emoji": "🇺🇿",
            "dial_code": "+998"
        },
        {
            "name": "Vietnam",
            "emoji": "🇻🇳",
            "dial_code": "+84"
        },
        {
            "name": "Yemen",
            "emoji": "🇾🇪",
            "dial_code": "+967"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 5 })));
}

async function seedEurope() {
    const countries = [
        {
            "name": "Albania",
            "emoji": "🇦🇱",
            "dial_code": "+355"
        },
        {
            "name": "Andorra",
            "emoji": "🇦🇩",
            "dial_code": "+376"
        },
        {
            "name": "Austria",
            "emoji": "🇦🇹",
            "dial_code": "+43"
        },
        {
            "name": "Belarus",
            "emoji": "🇧🇾",
            "dial_code": "+375"
        },
        {
            "name": "Belgium",
            "emoji": "🇧🇪",
            "dial_code": "+32"
        },
        {
            "name": "Bosnia & Herzegovina",
            "emoji": "🇧🇦",
            "dial_code": "+387"
        },
        {
            "name": "Bulgaria",
            "emoji": "🇧🇬",
            "dial_code": "+359"
        },
        {
            "name": "Croatia",
            "emoji": "🇭🇷",
            "dial_code": "+385"
        },
        {
            "name": "Czechia",
            "emoji": "🇨🇿",
            "dial_code": "+420"
        },
        {
            "name": "Denmark",
            "emoji": "🇩🇰",
            "dial_code": "+45"
        },
        {
            "name": "Estonia",
            "emoji": "🇪🇪",
            "dial_code": "+372"
        },
        {
            "name": "Finland",
            "emoji": "🇫🇮",
            "dial_code": "+358"
        },
        {
            "name": "France",
            "emoji": "🇫🇷",
            "dial_code": "+33"
        },
        {
            "name": "Germany",
            "emoji": "🇩🇪",
            "dial_code": "+49"
        },
        {
            "name": "Greece",
            "emoji": "🇬🇷",
            "dial_code": "+30"
        },
        {
            "name": "Hungary",
            "emoji": "🇭🇺",
            "dial_code": "+36"
        },
        {
            "name": "Iceland",
            "emoji": "🇮🇸",
            "dial_code": "+354"
        },
        {
            "name": "Ireland",
            "emoji": "🇮🇪",
            "dial_code": "+353"
        },
        {
            "name": "Italy",
            "emoji": "🇮🇹",
            "dial_code": "+39"
        },
        {
            "name": "Latvia",
            "emoji": "🇱🇻",
            "dial_code": "+371"
        },
        {
            "name": "Liechtenstein",
            "emoji": "🇱🇮",
            "dial_code": "+423"
        },
        {
            "name": "Lithuania",
            "emoji": "🇱🇹",
            "dial_code": "+370"
        },
        {
            "name": "Luxembourg",
            "emoji": "🇱🇺",
            "dial_code": "+352"
        },
        {
            "name": "Malta",
            "emoji": "🇲🇹",
            "dial_code": "+356"
        },
        {
            "name": "Moldova",
            "emoji": "🇲🇩",
            "dial_code": "+373"
        },
        {
            "name": "Monaco",
            "emoji": "🇲🇨",
            "dial_code": "+377"
        },
        {
            "name": "Montenegro",
            "emoji": "🇲🇪",
            "dial_code": "+382"
        },
        {
            "name": "Netherlands",
            "emoji": "🇳🇱",
            "dial_code": "+31"
        },
        {
            "name": "North Macedonia",
            "emoji": "🇲🇰",
            "dial_code": "+389"
        },
        {
            "name": "Norway",
            "emoji": "🇳🇴",
            "dial_code": "+47"
        },
        {
            "name": "Poland",
            "emoji": "🇵🇱",
            "dial_code": "+48"
        },
        {
            "name": "Portugal",
            "emoji": "🇵🇹",
            "dial_code": "+351"
        },
        {
            "name": "Romania",
            "emoji": "🇷🇴",
            "dial_code": "+40"
        },
        {
            "name": "San Marino",
            "emoji": "🇸🇲",
            "dial_code": "+378"
        },
        {
            "name": "Serbia",
            "emoji": "🇷🇸",
            "dial_code": "+381"
        },
        {
            "name": "Slovakia",
            "emoji": "🇸🇰",
            "dial_code": "+421"
        },
        {
            "name": "Slovenia",
            "emoji": "🇸🇮",
            "dial_code": "+386"
        },
        {
            "name": "Spain",
            "emoji": "🇪🇸",
            "dial_code": "+34"
        },
        {
            "name": "Sweden",
            "emoji": "🇸🇪",
            "dial_code": "+46"
        },
        {
            "name": "Switzerland",
            "emoji": "🇨🇭",
            "dial_code": "+41"
        },
        {
            "name": "Ukraine",
            "emoji": "🇺🇦",
            "dial_code": "+380"
        },
        {
            "name": "United Kingdom",
            "emoji": "🇬🇧",
            "dial_code": "+44"
        },
        {
            "name": "Vatican City",
            "emoji": "🇻🇦",
            "dial_code": "+379"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 3 })));
}

async function seedNorthAmerica() {
    // const continent = await Continent.create({ name: "North America" });
    const countries = [
        {
            "name": "Antigua & Barbuda",
            "emoji": "🇦🇬",
            "dial_code": "+1268"
        },
        {
            "name": "Bahamas",
            "emoji": "🇧🇸",
            "dial_code": "+1242"
        },
        {
            "name": "Barbados",
            "emoji": "🇧🇧",
            "dial_code": "+1246"
        },
        {
            "name": "Belize",
            "emoji": "🇧🇿",
            "dial_code": "+501"
        },
        {
            "name": "Canada",
            "emoji": "🇨🇦",
            "dial_code": "+1"
        },
        {
            "name": "Costa Rica",
            "emoji": "🇨🇷",
            "dial_code": "+506"
        },
        {
            "name": "Cuba",
            "emoji": "🇨🇺",
            "dial_code": "+53"
        },
        {
            "name": "Dominica",
            "emoji": "🇩🇲",
            "dial_code": "+1767"
        },
        {
            "name": "Dominican Republic",
            "emoji": "🇩🇴",
            "dial_code": "+1849"
        },
        {
            "name": "El Salvador",
            "emoji": "🇸🇻",
            "dial_code": "+503"
        },
        {
            "name": "Grenada",
            "emoji": "🇬🇩",
            "dial_code": "+1473"
        },
        {
            "name": "Guatemala",
            "emoji": "🇬🇹",
            "dial_code": "+502"
        },
        {
            "name": "Haiti",
            "emoji": "🇭🇹",
            "dial_code": "+509"
        },
        {
            "name": "Honduras",
            "emoji": "🇭🇳",
            "dial_code": "+504"
        },
        {
            "name": "Jamaica",
            "emoji": "🇯🇲",
            "dial_code": "+1876"
        },
        {
            "name": "Mexico",
            "emoji": "🇲🇽",
            "dial_code": "+52"
        },
        {
            "name": "Nicaragua",
            "emoji": "🇳🇮",
            "dial_code": "+505"
        },
        {
            "name": "Panama",
            "emoji": "🇵🇦",
            "dial_code": "+507"
        },
        {
            "name": "St. Kitts & Nevis",
            "emoji": "🇰🇳",
            "dial_code": "+1869"
        },
        {
            "name": "St. Lucia",
            "emoji": "🇱🇨",
            "dial_code": "+1758"
        },
        {
            "name": "St. Vincent & Grenadines",
            "emoji": "🇻🇨",
            "dial_code": "+1784"
        },
        {
            "name": "Trinidad & Tobago",
            "emoji": "🇹🇹",
            "dial_code": "+1868"
        },
        {
            "name": "United States",
            "emoji": "🇺🇸",
            "dial_code": "+1"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 1 })));
}

async function seedSouthAmerica() {
    const countries = [
        {
            "name": "Argentina",
            "emoji": "🇦🇷",
            "dial_code": "+54"
        },
        {
            "name": "Bolivia",
            "emoji": "🇧🇴",
            "dial_code": "+591"
        },
        {
            "name": "Brazil",
            "emoji": "🇧🇷",
            "dial_code": "+55"
        },
        {
            "name": "Chile",
            "emoji": "🇨🇱",
            "dial_code": "+56"
        },
        {
            "name": "Colombia",
            "emoji": "🇨🇴",
            "dial_code": "+57"
        },
        {
            "name": "Ecuador",
            "emoji": "🇪🇨",
            "dial_code": "+593"
        },
        {
            "name": "Guyana",
            "emoji": "🇬🇾",
            "dial_code": "+595"
        },
        {
            "name": "Paraguay",
            "emoji": "🇵🇾",
            "dial_code": "+595"
        },
        {
            "name": "Peru",
            "emoji": "🇵🇪",
            "dial_code": "+51"
        },
        {
            "name": "Suriname",
            "emoji": "🇸🇷",
            "dial_code": "+597"
        },
        {
            "name": "Uruguay",
            "emoji": "🇺🇾",
            "dial_code": "+598"
        },
        {
            "name": "Venezuela",
            "emoji": "🇻🇪",
            "dial_code": "+58"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 2 })));
}

async function seedAntarctica() {
    const countries = [
        {
            "name": "Antarctica",
            "emoji": "🇦🇶",
            "dial_code": "+672"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 7 })));
}

async function seedOceania() {
    const countries = [
        {
            "name": "Australia",
            "emoji": "🇦🇺",
            "dial_code": "+61"
        },
        {
            "name": "Fiji",
            "emoji": "🇫🇯",
            "dial_code": "+679"
        },
        {
            "name": "Kiribati",
            "emoji": "🇰🇮",
            "dial_code": "+686"
        },
        {
            "name": "Marshall Islands",
            "emoji": "🇲🇭",
            "dial_code": "+692"
        },
        {
            "name": "Micronesia",
            "emoji": "🇫🇲",
            "dial_code": "+691"
        },
        {
            "name": "Nauru",
            "emoji": "🇳🇷",
            "dial_code": "+674"
        },
        {
            "name": "New Zealand",
            "emoji": "🇳🇿",
            "dial_code": "+64"
        },
        {
            "name": "Palau",
            "emoji": "🇵🇼",
            "dial_code": "+680"
        },
        {
            "name": "Papua New Guinea",
            "emoji": "🇵🇬",
            "dial_code": "+675"
        },
        {
            "name": "Samoa",
            "emoji": "🇼🇸",
            "dial_code": "+685"
        },
        {
            "name": "Solomon Islands",
            "emoji": "🇸🇧",
            "dial_code": "+677"
        },
        {
            "name": "Tonga",
            "emoji": "🇹🇴",
            "dial_code": "+676"
        },
        {
            "name": "Tuvalu",
            "emoji": "🇹🇻",
            "dial_code": "+688"
        },
        {
            "name": "Vanuatu",
            "emoji": "🇻🇺",
            "dial_code": "+678"
        }
    ];
    await Country.bulkCreate(countries.map(item => ({ name: item.name, emoji: item.emoji, dial_code: item.dial_code, continentId: 6 })));
}

async function seedAllContinents() {
    try {
        // await seedAfrica();
        // await seedAsia();
        // await seedEurope();
        // await seedNorthAmerica();
        // await seedSouthAmerica();
        // await seedAntarctica();
        // await seedOceania();
        console.log('✅ All continents and countries seeded!');
    } catch (err) {
        console.error('❌ Error during seeding:', err);
    }
}

// seedAllContinents();

exports.getAllCountry = async (req, res) => {
    try {
        const {
            continent,
            search,
        } = req.query;

        // Build the where clause for filtering
        const where = {};
        const include = [];

        // Filter by continent (name or ID)
        if (continent) {
            include.push({
                model: Continent,
                as: 'continent',
                where: Number.isInteger(parseInt(continent))
                    ? { id: parseInt(continent) }
                    : { name: continent },
            });
        }

        // Search by country name or code
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { code: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Execute query
        const countries = await Country.findAndCountAll({
            where,
            include,
            attributes: ['id', 'name', 'emoji', 'dial_code', 'continentId'],
            order: [['name', 'ASC']],
        });

        res.json({
            success: true,
            data: countries.rows,
        });

    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
