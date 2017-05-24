/*eslint-disable */

'use strict';

const today = new Date();
const firstInMonth = new Date();
firstInMonth.setDate(1);

const lastInPrevMonth = new Date();
lastInPrevMonth.setDate(0);

const firstInPrevMonth = new Date();
firstInPrevMonth.setDate(0);
firstInPrevMonth.setDate(1);

const dateLastMonth = new Date();
dateLastMonth.setMonth(today.getMonth() - 1);

const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getRandomInt = (min, max) => {
  return Math.ceil(getRandom(min, max)) + min;
};

module.exports = {
  'api': {
    'port': 9999,
    'token': 'TOKEN_FOR_API',
  },
  'redis': {
    'db': 7
  },
  'zen': [
    'Joke shit',
  ],
  'geckoBoard': {
    'apiKey': 'GECKOBOARD_WIDGET_API_KEY',
  },
  'chartMogul': {
    'apiUrl': 'https://api.chartmogul.mock/v1',
    'apiToken': 'CHARTMOGUL_API_TOKEN',
    'apiSecret': 'CHARTMOGUL_API_SECRET',
    'leads': {
      'startPage': 1,
    },
    'customers': {
      'startPage': 1,
    },
  },
  'google-analytics': {
    'apiUrl': 'https://www.googleapis.mock/analytics/v3/data/ga',
    'auth': {
      'apiUrl': '',
      'iss': 'mocky@test.mochaTest.tdd',
      'scope': 'https://www.googleapis.mock/auth/analytics.readonly',
      'aud': 'https://www.googleapis.mock/oauth2/v2/token',
      'keyFile': './google-credentials.pem'
    },
    'viewId': '4•8•15•16•33•42|4•8•15•16•33•42|4•8•15•16•33•42'
  },
  "wootric" : {
    "authUrl": "https://api.wootric.mock/oauth/token",
    "apiUrl": "https://api.wootric.mock/v1",
    "clientID": "WOOTRIC_CLIENT_ID",
    "clientSecret": "WOOTRIC_CLIENT_SECRET",
  },
  'request': {
    'chartMogul': {
      'plans': {
        'plans': [{
            'external_id': 'bej-ac-neug-riako',
            'name': 'Bej ac neug riako',
            'uuid': '5140ddc9-3d62-5f8a-ad78-8bc5bc31faf0',
          },
          {
            'external_id': 'ferih-uhkogi-uki',
            'name': 'Ferih uhkogi uki',
            'uuid': '068cf150-82cf-578c-99d1-1a9a152a4874',
          },
          {
            'external_id': 'fumoce-du-mi-fuvo',
            'name': 'Fumoce du mi fuvo',
            'uuid': '78d3839-3649-59f9-b58d-deb49cc919af',
          },
          {
            'external_id': 'lajlafu',
            'name': 'Lajlafu',
            'uuid': '83b1c19e-e449-51cb-b40f-14ff4aef7c06',
          },
          {
            'external_id': 'vovokjel-lofu',
            'name': 'Vovokjel lofu',
            'uuid': '830dea-33c8-52b1-b010-9ecb1ca97820',
          },
          {
            'external_id': 'la-do-guvwiztup',
            'name': 'La do guvwiztup',
            'uuid': '095bfe44-9c6c-5a2c-893c-16785935b37a',
          },
          {
            'external_id': 'fusu-rifmi-gikfuhduf-ra',
            'name': 'Fusu rifmi gikfuhduf ra',
            'uuid': '5bafa9f9-8c99-535c-a294-99428f79df96',
          },
          {
            'external_id': 'rapik',
            'name': 'Rapik',
            'uuid': '130dc4ee-d5b0-5d6d-995a-5757ce24db9d',
          },
          {
            'external_id': 'behcuat-guab',
            'name': 'Behcuat guab',
            'uuid': '32357883-43c4-57f3-9093-63616df4ba1c',
          }
        ],

      },
      'metrics': {
        'entries': [{
            'date': '2015-01-31',
            'customer-churn-rate': 20,
            'mrr-churn-rate': 14,
            'ltv': 1250.3,
            'customers': 331,
            'asp': 125,
            'arpa': 1250,
            'arr': 254000,
            'mrr': 21166,
          },
          {
            'date': '2015-02-28',
            'customer-churn-rate': 20,
            'mrr-churn-rate': 22,
            'ltv': 1248,
            'customers': 329,
            'asp': 125,
            'arpa': 1250,
            'arr': 238000,
            'mrr': 21089,
          },
        ],
        'summary': {
          'current': 4315000,
          'previous': 4315000,
          'percentage-change': 0.0,
        },
      },
      'mrr': {
        'entries': [{
            'date': '2015-12-31',
            'mrr': 771337,
            'mrr-new-business': 147781,
            'mrr-expansion': 2716,
            'mrr-contraction': -442,
            'mrr-churn': -68891,
            'mrr-reactivation': 0,
          },
          {
            'date': lastInPrevMonth.toISOString().slice(0, 10),
            'mrr': 1008786,
            'mrr-new-business': 356162,
            'mrr-expansion': 8537,
            'mrr-contraction': -3799,
            'mrr-churn': -125130,
            'mrr-reactivation': 0,
          },
          {
            'date': today.toISOString().slice(0, 10),
            'mrr': 1000130,
            'mrr-new-business': 98458,
            'mrr-expansion': 1800,
            'mrr-contraction': -2970,
            'mrr-churn': -109447,
            'mrr-reactivation': 9470,
          },
        ],
        'summary': {
          'current': 3248986,
          'previous': 3213650,
          'percentage-change': 1.1,
        },
      },
      'arr': {
        'entries': [{
            'date': '2015-01-31',
            'arr': 360000,
          },
          {
            'date': lastInPrevMonth.toISOString().slice(0, 10),
            'arr': 36600000,
          },
        ],
        'summary': {
          'current': 305520000,
          'previous': 305520000,
          'percentage-change': 0.0,
        },
      },
      'arpa': {
        'entries': [{
            'date': '2015-01-03',
            'arpa': 15000,
          },
          {
            'date': '2015-01-10',
            'arpa': 15000,
          },
        ],
        'summary': {
          'current': 980568,
          'previous': 980568,
          'percentage-change': 0.0,
        },
      },
      'customersCount': {
        'entries': [{
            'date': '2015-07-31',
            'customers': 10,
          },
          {
            'date': '2015-07-31',
            'customers': 382,
          },
        ],
        'summary': {
          'current': 382,
          'previous': 379,
          'percentage-change': 0.8,
        },
      },
      'customersCountForPlans': [{
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(1, 300),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(12, 100),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(12, 100),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(1, 300),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(1, 100),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(1, 150),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(1, 150),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(1, 150),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(1, 30),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(10, 300),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': 1,
            },
            {
              'date': '2015-07-31',
              'customers': 1,
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(10, 500),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(1, 10),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(1, 50),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(10, 150),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(1, 250),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(1, 10),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(15, 20),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(1, 100),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
        {
          'entries': [{
              'date': '2015-07-31',
              'customers': getRandomInt(100, 900),
            },
            {
              'date': '2015-07-31',
              'customers': getRandomInt(90, 300),
            },
          ],
          'summary': {
            'current': 382,
            'previous': 379,
            'percentage-change': 0.8,
          },
        },
      ],
      'mrrChurnRate': {
        'entries': [{
            'date': '2015-01-31',
            'mrr-churn-rate': -300.0,
          },
          {
            'date': '2015-02-28',
            'mrr-churn-rate': -0.0,
          },
        ],
        'summary': {
          'current': 0,
          'previous': 0,
          'percentage-change': 0.0,
        },
      },
      'customers': [{
          'entries': [{
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Iva Warner',
              'status': 'Lead',
              'customer-since': '',
              'company': 'Zigilovo',
              'country': 'US',
              'state': 'WA',
              'city': 'Brush Prairie',
              'lead_created_at': lastInPrevMonth.toISOString(),
              'free_trial_started_at': '2014-08-28T14:34:20.000Z',
              'mrr': getRandom(100, 990000),

              'address': {
                'country': 'United States',
                'state': 'Washington',
                'city': 'Brush Prairie',
                'address_zip': '98606',
              },
            },
            {
              "uuid": "TmLykDPpNhqUpp5a",
              'name': 'Maria Isabella Bonechi',
              'status': 'Cancelled',
              'customer-since': new Date(dateLastMonth.setDate(getRandomInt(1, 29))).toISOString(),
              'company': 'Fuuhu',
              'country': 'FR',
              'state': null,
              'city': 'Paris',
              'lead_created_at': new Date(dateLastMonth.setDate(getRandomInt(1, 29))).toISOString(),
              'free_trial_started_at': '2014-09-03T09:00:47.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'France',
                'state': null,
                'city': 'Paris',
                'address_zip': '75017',
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Ola Katie Nunez ',
              'status': 'Active',
              'customer-since': new Date(dateLastMonth.setDate(getRandomInt(1, 29))).toISOString(),
              'company': 'NofsafDor',
              'country': 'US',
              'state': 'IL',
              'city': 'Urbana',
              'lead_created_at': new Date(dateLastMonth.setDate(getRandomInt(1, 29))).toISOString(),
              'free_trial_started_at': '2014-09-03T14:29:54.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'United States',
                'state': 'Illinois',
                'city': 'Urbana',
                'address_zip': '61801',
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Dollie Daisy',
              'status': 'Cancelled',
              'customer-since': new Date(dateLastMonth.setDate(getRandomInt(1, 29))).toISOString(),
              'company': 'TuwU',
              'country': 'US',
              'state': 'FL',
              'city': 'MIAMI',
              'lead_created_at': dateLastMonth.toISOString(),
              'free_trial_started_at': '2014-09-15T16:02:54.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'United States',
                'city': 'MIAMI',
                'address_zip': '33166',
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Christian Craig Fitzgerald',
              'status': 'Lead',
              'customer-since': firstInPrevMonth.toISOString(),
              'company': 'Ogauhma',
              'country': 'HK',
              'state': null,
              'city': 'Mong Kok',
              'lead_created_at': new Date(dateLastMonth.setDate(getRandomInt(1, 29))).toISOString(),
              'free_trial_started_at': '2014-09-17T09:19:35.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'Hong Kong',
                'state': null,
                'city': 'Mong Kok',
                'address_zip': '000000',
              },
            },
            {
              "uuid": "TmLykDPpNhqUpp5a",
              'name': 'Francis Eliza',
              'status': 'Lead',
              'customer-since': today.toISOString(),
              'company': 'Dudevuf',
              'country': 'CA',
              'state': null,
              'city': 'Moncton',
              'lead_created_at': new Date(dateLastMonth.setDate(10)).toISOString(),
              'free_trial_started_at': '2014-09-26T13:39:47.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'Canada',
                'state': null,
                'city': 'Moncton',
                'address_zip': 'E1G0R9',
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Ida Lizzie Garrett',
              'status': 'Lead',
              'customer-since': '2014-01-12T14:42:19+00:00',
              'company': 'Suchaube',
              'country': 'IN',
              'state': null,
              'city': 'g11, hyderabad',
              'lead_created_at': '2017-02-28T14:42:19.000Z',
              'free_trial_started_at': '2014-09-28T14:42:19.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'India',
                'state': null,
                'city': 'g11, hyderabad',
                'address_zip': '500032',
              },
            },
          ],
          'current_page': 1,
          'total_pages': 2,
          'has_more': true,
          'per_page': 7,
          'page': 1,
        },
        {
          'entries': [{
              "uuid": "TmLykDPpNhqUpp5a",
              'name': 'Ray Coleman',
              'status': 'Lead',
              'customer-since': today.toISOString(),
              'company': 'Ikeo',
              'country': 'SE',
              'state': null,
              'city': 'Stockholm',
              'zip': '11633',
              'lead_created_at': lastInPrevMonth.toISOString(),
              'free_trial_started_at': '2017-03-16T10:22:34.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'Sweden',
                'state': null,
                'city': 'Stockholm',
                'address_zip': '11633',
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Edwin Young',
              'status': 'Lead',
              'customer-since': null,
              'company': 'Zurateg',
              'country': 'US',
              'state': 'CA',
              'zip': '92173',
              'lead_created_at': new Date(dateLastMonth.setDate(getRandomInt(1, 30))).toISOString(),
              'free_trial_started_at': '2017-03-16T20:26:23.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'United States',
                'state': 'California',
                'address_zip': '92173',
              },
            },
            {
              "uuid": "TmLykDPpNhqUpp5a",
              'name': 'Cristiano Santucci Elia',
              'status': 'Lead',
              'customer-since': null,
              'company': 'Cervapda',
              'country': 'AE',
              'state': null,
              'city': null,
              'zip': null,
              'lead_created_at': today.toISOString(),
              'free_trial_started_at': '2017-03-16T21:57:34.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'United Arab Emirates',
                'state': null,
                'city': null,
                'address_zip': null,
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Gianna Rossella Cellini',
              'status': 'Lead',
              'customer-since': null,
              'company': '',
              'country': 'US',
              'state': 'IL',
              'city': 'Chicago',
              'zip': '60614',
              'lead_created_at': '2017-01-17T04:09:02.000Z',
              'free_trial_started_at': '2017-03-17T04:09:02.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'United States',
                'state': 'Illinois',
                'city': 'Chicago',
                'address_zip': '60614',
              },
            },
            {
              "uuid": "kZVfJxGSdvLDP4rn",
              'name': 'Gianna Rossella Stone',
              'status': 'Lead',
              'customer-since': null,
              'company': 'Fidetadaz',
              'country': 'TH',
              'state': null,
              'city': 'Mae Hong Son',
              'zip': '58000',
              'lead_created_at': today.toISOString(),
              'free_trial_started_at': '2017-03-17T07:25:36.000Z',
              'mrr': getRandom(100, 990000),
              'address': {
                'country': 'Thailand',
                'state': null,
                'city': 'Mae Hong Son',
                'address_zip': '58000',
              },
            },
          ],
          'current_page': 2,
          'total_pages': 2,
          'has_more': false,
          'per_page': 200,
          'page': 2,
        },
        {
          'entries': [],
          'current_page': 123,
          'total_pages': 2,
          'has_more': false,
          'per_page': 7,
          'page': 123,
        },
      ],
      'subscriptions': {
        'kZVfJxGSdvLDP4rn': {
          "entries": [{
            "id": 23456789,
            "external_id": "253970e88750737249a995968e295a",
            "plan": "Guru",
            "quantity": 1,
            "mrr": 20122,
            "arr": 241464,
            "status": "active",
            "billing-cycle": "month",
            "billing-cycle-count": getRandomInt(1, 12),
            "start-date": "2017-05-13T00:00:00+00:00",
            "end-date": "2017-06-13T17:56:24+00:00",
            "currency": "EUR",
            "currency-sign": "€"
          }]
        },
        'TmLykDPpNhqUpp5a': {
          "entries": [{
            "id": 12345,
            "external_id": "66354ec0b204ea41a931338",
            "plan": "Starter",
            "quantity": 1,
            "mrr": 4900,
            "arr": 58800,
            "status": "active",
            "billing-cycle": "month",
            "billing-cycle-count": getRandomInt(1, 10),
            "start-date": "2017-05-12T00:00:00+00:00",
            "end-date": "2017-06-12T08:33:14+00:00",
            "currency": "EUR",
            "currency-sign": "€"
          }]
        }
      },
    },
    'ga': {
      'newUsers': {}
    },
    'wootric' : {
      'auth' : {
        "access_token":"BEARER_TOKEN_FOR_DASHY",
        "token_type":"bearer",
        "created_at":1495628127,
        "expires_in":7200,
        "scope":"public"  
      },
      'nps_summary' : {
        "nps": getRandomInt(10,99),
        "responses": getRandomInt(0,50),
        "detractors": getRandomInt(10,50),
        "passives": getRandomInt(10,50),
        "promoters": getRandomInt(10,50),
        "response_rate": getRandomInt(0,50),
        "email_response_rate": getRandomInt(0,30)
      }
    }
  },
};
