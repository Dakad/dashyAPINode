/**
 * Test Unit for the Gecko Formatter component. 
 * 
 */

// -------------------------------------------------------------------
// Dependencies
// Packages
const {
  expect
} = require('chai');
// const sinon = require('sinon');


// Built-in

// Mine
const GeckoFormatter = require('../src/components/gecko-formatter');



// -------------------------------------------------------------------
// Properties



describe('Component : GeckoFormatter', () => {

  beforeEach(() => {
  });

  describe('should throws Error for', () => {
    const err = 'Items is required and cannot be null or empty';

    it('Funnel widget', () => {
      expect(GeckoFormatter.toFunnel).to.throw(err);
      expect(GeckoFormatter.toFunnel.bind(GeckoFormatter)).to.throw(Error);
      expect(GeckoFormatter.toFunnel.bind(GeckoFormatter, null)).to.throw(err);
      expect(GeckoFormatter.toFunnel.bind(GeckoFormatter, [])).to.throw(err);
    });

    it('LeaderBoard widget', () => {
      expect(GeckoFormatter.toLeaderboard).to.throw(err);
      expect(GeckoFormatter.toLeaderboard.bind(GeckoFormatter))
        .to.throw(err);
      expect(GeckoFormatter.toLeaderboard.bind(GeckoFormatter, null))
        .to.throw(err);
      expect(GeckoFormatter.toLeaderboard.bind(GeckoFormatter, []))
        .to.throw(err);
    });

  });

  describe('shoulld rendered for', () => {
    /** Correspond to the response handler in routes */
    const resp = (data) => JSON.parse(JSON.stringify(data));

    it('Funnel widget', () => {
      expect(resp(GeckoFormatter.toFunnel([
        ['Item1', 12345],
        ['Lost', 4815162342]
      ]))).eql({
        "item": [{
            "label": "Item1",
            "value": 12345,
          },
          {
            "label": "Lost",
            "value": 4815162342,
          }
        ],
        "percentage": "hide"
      });

      expect(resp(GeckoFormatter.toFunnel([
        ['Item1', 12345],
        ['Lost', 4815162342]
      ],false))).eql({
        "item": [{
            "label": "Item1",
            "value": 12345,
          },
          {
            "label": "Lost",
            "value": 4815162342,
          }
        ],
      });


    });

    it('LeaderBoard widget', () => {
      expect(resp(GeckoFormatter.toLeaderboard([
        ['Item1', 12345],
        ['Lost', 4815162342]
      ]))).eql({
        "format": "decimal",
        "items": [{
            "label": "Item1",
            "value": 12345,
          },
          {
            "label": "Lost",
            "value": 4815162342,
          }
        ],
      });
      expect(resp(GeckoFormatter.toLeaderboard([
        ['Item1', 12345],
        ['Lost', 4815162342]
      ], 'decimal', '$'))).eql({
        "format": "currency",
        "unit": "$",
        "items": [{
            "label": "Item1",
            "value": 12345,
          },
          {
            "label": "Lost",
            "value": 4815162342,
          }
        ],
      });

      expect(resp(GeckoFormatter.toLeaderboard([
        ['Item1', 12345],
        ['Lost', 4815162342]
      ], 'currency'))).eql({
        "format": "currency",
        "unit": '€',
        "items": [{
            "label": "Item1",
            "value": 12345,
          },
          {
            "label": "Lost",
            "value": 4815162342,
          }
        ],
      });

    });

    it('Geck-O-Meter widget', () => {
      expect(resp(GeckoFormatter.toGeckOMeter(
        23, 10, 30
      ))).to.eql({
        "item": 23,
        "min": {
          "value": 10
        },
        "max": {
          "value": 30
        }
      });

      expect(resp(GeckoFormatter.toGeckOMeter(
        23, 10, 30, 'sdfds', '$'
      ))).to.eql({
        "format": "currency",
        "unit": "$",
        "item": 23,
        "min": {
          "value": 10
        },
        "max": {
          "value": 30
        }
      });

    });

    it('Monitoring widget', () => {
      expect(resp(GeckoFormatter.toMonitoring(
        true,
        '3 days ago',
        '123 ms'
      ))).to.eql({
        "status": "Down",
        "downTime": "NOW",
        "responseTime": "123 ms"
      });
      expect(resp(GeckoFormatter.toMonitoring(
        false,
        '13 days ago',
        '567 s'
      ))).to.eql({
        "status": "Up",
        "downTime": "13 days ago",
        "responseTime": "567 s"
      });

    });

    it('Text widget', () => {
      expect(resp(GeckoFormatter.toText(
        "production-web-1: NOT RESPONDING"
      ))).to.eql({
        "item": [
          {
            "text": "production-web-1: NOT RESPONDING",
            "type" : 0
          }
        ]
      });
            
      expect(resp(GeckoFormatter.toText({
        "text": "As you might know, I am a full time Internet",
        "type": 1
      }))).to.eql({
        "item": [
          {
            "text": "As you might know, I am a full time Internet",
            "type": 1
          }
        ]
      });
            
      expect(resp(GeckoFormatter.toText([
        {
          "text": "3 to-do items are due next week",
          "type": 2
        },{
          "text": "production-web-1: NOT RESPONDING",
          "type": 1
        }
      ]))).to.eql({
        "item": [
          {
            "text": "3 to-do items are due next week",
            "type": 2
          },{
            "text": "production-web-1: NOT RESPONDING",
            "type": 1
          }
        ]
      });



    });

    


  });


});
