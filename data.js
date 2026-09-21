/* Pure mock data for the Shopper Agent analytics prototype. No logic here. */
const SHOPPER_AGENT_DATA = {
  weekLabels: ['Sep 14', 'Sep 15', 'Sep 16', 'Sep 17', 'Sep 18', 'Sep 19', 'Sep 20'],

  /* Adoption tab — monthly growth lenses. overallSessionsPct ends at 11.9 (continuous with the weekly
     session data), deviceMonthly keeps the 64/36 Mobile/Web split and sums to ~9,900 monthly agent sessions. */
  adoption: {
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    overallSessionsPct: [6.4, 7.8, 8.9, 9.7, 10.8, 11.9],
    monthlyUsers: [3980, 4620, 5350, 6010, 6740, 7420],
    repeatUsersPct: [11.0, 13.2, 15.1, 16.8, 18.4, 20.0],
    deviceMonthly: [
      { type: 'Mobile', count: 6340 },
      { type: 'Web', count: 3560 }
    ],
    /* Average agent session length by device (seconds). Web runs longer — more considered desktop browsing. */
    sessionDuration: [
      { type: 'Mobile', seconds: 228 },
      { type: 'Web', seconds: 312 }
    ]
  },

  /* Revenue tab — money outcomes for agent-attributed shopping this week (Sep 14–20).
     Anchors that MUST tie to existing data:
       dailyRevenue sums to $21,600 (agent revenue KPI) · dailyOrders sums to 161 (2,368 sessions × 6.8% conv)
       aovAgentHeadline 134.20 = agent AOV KPI · aovNoAgentHeadline 116.40 = no-agent AOV (+15% lift)
       ordersTiedToAgent 161 = all agent-assisted orders · ordersDirectFromAgent 118 = express-checkout successes (cartView). */
  revenue: {
    dailyRevenue: [2720, 2850, 3070, 3000, 3290, 3460, 3210],
    dailyOrders: [20, 21, 23, 22, 25, 26, 24],
    /* Illustrative daily AOV by cohort ($). Agent baskets run ~15% larger; each series averages to the headline below. */
    aovAgent: [131.60, 133.20, 132.40, 134.80, 134.00, 136.40, 137.00],
    aovNoAgent: [115.80, 116.20, 115.40, 117.00, 116.60, 117.40, 116.40],
    aovAgentHeadline: 134.20,
    aovNoAgentHeadline: 116.40,
    ordersTiedToAgent: 161,
    ordersDirectFromAgent: 118
  },

  /* Cart tab — basket economics, checkout-method split, and agent-vs-no-agent cart performance.
     Anchors that MUST tie: 436 agent carts (18.4% ATC × 2,368) · 161 orders · $21,600 revenue · $134.20 AOV.
       Economics: $88.00 avg cart value × 436 = $38,368 total in carts; $21,600 (56.3%) converts to revenue.
       Units: 436 carts × 1.9 = 828 units in cart; 161 orders × 2.3 = 370 units sold (abandoned carts run smaller).
       Checkout method: 118 express + 43 standard = 161 orders.
       Abandonment: agent 275/436 = 63.1%; no-agent 1,210/1,683 = 71.9% (17,531 sessions × 9.6% ATC = 1,683 carts, 473 orders). */
  cart: {
    avgCartValue: 88.00,
    unitsPerCart: 1.9,
    totalCartValue: 38368,
    convertedRevenue: 21600,
    convertedPct: 56.3,
    checkoutMethods: [
      { method: 'Express Checkout', count: 118, pct: 73.3 },
      { method: 'Standard Checkout', count: 43, pct: 26.7 }
    ],
    comparison: [
      { metric: 'Cart Abandonment Rate', agent: '63.1%', noAgent: '71.9%', lift: '-8.8 pts' },
      { metric: 'Units per Order', agent: '2.3', noAgent: '1.7', lift: '+35%' }
    ]
  },

  cohorts: {
    all: {
      key: 'all', label: 'All Shopping',
      dailySessions: [2698, 2762, 2837, 2709, 2961, 3079, 2853],
      kpis: [
        { key: 'sessions', label: 'Sessions', value: '19,899', delta: '+2.6%', good: true, trend: [35, 40, 38, 45, 50, 48, 55, 60] },
        { key: 'revenue', label: 'Revenue', value: '$76,657', delta: '+4.0%', good: true, trend: [35, 40, 38, 45, 50, 48, 55, 60] },
        { key: 'conversionRate', label: 'Conversion Rate', value: '3.2%', delta: '+0.1 pts', good: true, trend: [48, 50, 47, 51, 49, 52, 50, 53] },
        { key: 'addToCartRate', label: 'Add-to-Cart Rate', value: '10.7%', delta: '+0.5 pts', good: true, trend: [35, 40, 38, 45, 50, 48, 55, 60] },
        { key: 'abandonRate', label: 'Abandon Rate', value: '6.0%', delta: '-0.1 pts', good: true, trend: [60, 55, 58, 50, 48, 45, 42, 40] }
      ]
    },
    agent: {
      key: 'agent', label: 'Shopping Agent',
      dailySessions: [298, 312, 337, 329, 361, 379, 352],
      kpis: [
        { key: 'sessions', label: 'Sessions', value: '2,368', delta: '+17.9%', good: true, trend: [30, 38, 42, 50, 55, 60, 68, 75] },
        { key: 'revenue', label: 'Revenue', value: '$21,600', delta: '+21.0%', good: true, trend: [30, 38, 42, 50, 55, 60, 68, 75] },
        { key: 'conversionRate', label: 'Conversion Rate', value: '6.8%', delta: '+0.7 pts', good: true, trend: [35, 40, 38, 45, 50, 48, 55, 60] },
        { key: 'aov', label: 'Average Order Value', value: '$134.20', delta: '+5.0%', good: true, trend: [40, 44, 42, 48, 52, 55, 58, 62] }
      ]
    },
    noAgent: {
      key: 'noAgent', label: 'No Shopping Agent',
      dailySessions: [2400, 2450, 2500, 2380, 2600, 2700, 2501],
      kpis: [
        { key: 'sessions', label: 'Sessions', value: '17,531', delta: '+1.2%', good: true, trend: [48, 50, 47, 51, 49, 52, 50, 53] },
        { key: 'revenue', label: 'Revenue', value: '$55,057', delta: '+2.1%', good: true, trend: [48, 50, 47, 51, 49, 52, 50, 53] },
        { key: 'conversionRate', label: 'Conversion Rate', value: '2.7%', delta: '+0.1 pts', good: true, trend: [48, 50, 47, 51, 49, 52, 50, 53] },
        { key: 'addToCartRate', label: 'Add-to-Cart Rate', value: '9.6%', delta: '+0.3 pts', good: true, trend: [48, 50, 47, 51, 49, 52, 50, 53] },
        { key: 'abandonRate', label: 'Abandon Rate', value: '6.4%', delta: '-0.1 pts', good: true, trend: [52, 50, 53, 49, 51, 48, 50, 49] }
      ]
    }
  },

  /* Agent-scoped concepts — do not exist outside agent sessions, so these stay fixed regardless of the cohort toggle. */
  topIntents: [
    { intent: 'Product Expert', sessions: 1897, pct: 80.1, revenue: 18950 },
    { intent: 'Cart', sessions: 231, pct: 9.8, revenue: 2650 },
    { intent: 'WISMO', sessions: 165, pct: 7.0, revenue: 0 },
    { intent: 'FAQ', sessions: 75, pct: 3.2, revenue: 0 }
  ],

  mostComparedProducts: [
    { pair: 'Aria Knit Sneaker — White vs Black', count: 86 },
    { pair: 'Summit Trail Jacket vs Ridgeline Storm Shell', count: 74 },
    { pair: 'Classic Denim — Straight vs Slim', count: 61 },
    { pair: 'Everyday Tote — Tan vs Black', count: 53 },
    { pair: 'Cloudform Runner vs Runner Low', count: 47 },
    { pair: 'Weekend Backpack — Slate vs Olive', count: 39 },
    { pair: 'Studio Hoodie vs Crewneck', count: 34 },
    { pair: 'Trail Sock vs Everyday Sock 3-Pack', count: 28 }
  ],

  entryMethod: [
    { method: 'Prefilled Options', count: 1421, pct: 60.0 },
    { method: 'Typed', count: 947, pct: 40.0 }
  ],

  topQuestions: [
    { q: 'Do you have this in a size 9?', count: 412 },
    { q: "What's the status of my order?", count: 298 },
    { q: 'Can you compare these two jackets?', count: 254 },
    { q: "What's your return policy?", count: 221 },
    { q: 'Is this true to size?', count: 198 },
    { q: 'Do you have free shipping?', count: 176 },
    { q: 'Can I cancel my order?', count: 142 },
    { q: 'What material is this made of?', count: 129 }
  ],

  noAnswerQuestions: [
    { q: 'Can I speak to a human?', count: 64 },
    { q: 'Do you price match?', count: 41 },
    { q: 'Is this available in-store near me?', count: 37 },
    { q: 'Can you track my package by phone number?', count: 29 },
    { q: "What's the status of my return refund?", count: 22 }
  ],

  deflection: { totalAsked: 4120, noAnswer: 193, ratePct: 95.3 },

  /* Same 4,120 asked / 193 unanswered, split by intent — sums reconcile exactly to the blended totals above. */
  deflectionByIntent: [
    { intent: 'Product Expert', totalAsked: 2847, noAnswer: 88, ratePct: 96.9 },
    { intent: 'Cart', totalAsked: 512, noAnswer: 21, ratePct: 95.9 },
    { intent: 'WISMO', totalAsked: 581, noAnswer: 61, ratePct: 89.5 },
    { intent: 'FAQ', totalAsked: 180, noAnswer: 23, ratePct: 87.2 }
  ],

  funnel: {
    stages: [
      { label: 'Session Started', count: 2368, pct: 100 },
      { label: 'Products Shown', count: 1897, pct: 80.1 },
      { label: 'Action Taken', count: 1266, pct: 53.5 },
      { label: 'Added to Cart', count: 436, pct: 18.4 }
    ],
    actionBreakdown: [
      { action: 'Dive Deeper', count: 368, pct: 29.1 },
      { action: 'Add To Cart From Agent', count: 260, pct: 20.5 },
      { action: 'Comparison', count: 236, pct: 18.6 },
      { action: 'PDP Page', count: 402, pct: 31.8 }
    ],
    pdpBreakdown: [
      { outcome: 'Add to Cart', count: 176, pct: 43.8 },
      { outcome: 'Back to Agent', count: 152, pct: 37.8 },
      { outcome: 'Abandon Session', count: 74, pct: 18.4 }
    ]
  },

  /* Same session flow, cut by router intent. Started counts reuse topIntents exactly.
     Product Expert/Cart end in a revenue-driving step; WISMO/FAQ (both $0 revenue in topIntents)
     end in a service-resolution step instead, since forcing them through "Added to Cart" would be fiction. */
  funnelByIntent: [
    { intent: 'Product Expert', stages: [
      { label: 'Started', count: 1897, pct: 100 },
      { label: 'Action Taken', count: 1266, pct: 66.7 },
      { label: 'Added to Cart', count: 436, pct: 23.0 }
    ]},
    { intent: 'Cart', stages: [
      { label: 'Started', count: 231, pct: 100 },
      { label: 'Reviewed Cart', count: 215, pct: 93.1 },
      { label: 'Completed Cart Action', count: 96, pct: 41.6 }
    ]},
    { intent: 'WISMO', stages: [
      { label: 'Started', count: 165, pct: 100 },
      { label: 'Order Status Shown', count: 148, pct: 89.7 },
      { label: 'Resolved, No Escalation', count: 121, pct: 73.3 }
    ]},
    { intent: 'FAQ', stages: [
      { label: 'Started', count: 75, pct: 100 },
      { label: 'Answer Given', count: 71, pct: 94.7 },
      { label: 'Resolved, No Escalation', count: 63, pct: 84.0 }
    ]}
  ],

  /* Session Flow drill-down — decomposes each subagent's key mid-funnel stage. Sub-steps reconcile to funnelByIntent:
     Product Expert 402+368+260+236 = 1,266 (Action Taken) · Cart 58+24+14 = 96 (Completed Cart Action)
     WISMO 82+27+12 = 121 (Resolved) · FAQ 31+20+12 = 63 (Resolved). */
  subagentDetail: {
    'Product Expert': {
      stepLabel: 'What shoppers did after products were shown',
      note: 'Of the 1,266 Product Expert sessions that took an action.',
      steps: [
        { label: 'Viewed PDP', count: 402 },
        { label: 'Dive Deeper', count: 368 },
        { label: 'Add-to-Cart from Agent', count: 260 },
        { label: 'Comparison', count: 236 }
      ]
    },
    'Cart': {
      stepLabel: 'How cart actions completed',
      note: 'Of the 96 Cart sessions that completed a cart action.',
      steps: [
        { label: 'Proceeded to Checkout', count: 58 },
        { label: 'Applied Promo Code', count: 24 },
        { label: 'Updated Cart', count: 14 }
      ]
    },
    'WISMO': {
      stepLabel: 'How order-status requests resolved',
      note: 'Of the 121 WISMO sessions resolved without escalation.',
      steps: [
        { label: 'Tracking Link Sent', count: 82 },
        { label: 'Delivery Estimate Given', count: 27 },
        { label: 'Return Initiated', count: 12 }
      ]
    },
    'FAQ': {
      stepLabel: 'How questions were answered',
      note: 'Of the 63 FAQ sessions resolved without escalation.',
      steps: [
        { label: 'Policy Answered', count: 31 },
        { label: 'Shipping Info', count: 20 },
        { label: 'Product Info', count: 12 }
      ]
    }
  },

  agentVsNoAgent: [
    { metric: 'Conversion Rate', agent: '6.8%', noAgent: '2.7%', lift: '+152%' },
    { metric: 'Average Order Value', agent: '$134.20', noAgent: '$116.40', lift: '+15%' },
    { metric: 'Revenue per Visit', agent: '$9.12', noAgent: '$3.14', lift: '+190%' },
    { metric: 'Units per Transaction', agent: '2.3', noAgent: '1.7', lift: '+35%' }
  ],

  topProducts: {
    bestSellers: [
      { name: 'Aria Knit Sneaker', units: 74, revenue: 4440 },
      { name: 'Cloudform Runner', units: 58, revenue: 4930 },
      { name: 'Classic Denim Straight', units: 68, revenue: 3400 },
      { name: 'Everyday Tote', units: 37, revenue: 1850 },
      { name: 'Summit Trail Jacket', units: 21, revenue: 3150 }
    ]
  },

  /* Product Engagement — event/interaction-level metrics (searches, impressions, clicks, views, cart events).
     Naturally higher than the session-level Session Funnel counts, since one session fires many events.
     Anchors that MUST tie to existing session-level data:
       widget.sessions 2,368 = agent sessions · addToCart.fromAgentInline 260 = funnel "Add To Cart From Agent"
       addToCart.fromPDP 176 = funnel PDP "Add to Cart" · addToCart.total 436 = funnel "Added to Cart"
       comparison.sessions 236 = funnel "Comparison" action · cartView ends at 161 orders = 6.8% conv x 2,368. */
  productEngagement: {
    widget: {
      sessions: 2368,
      device: [
        { type: 'Mobile', count: 1516, pct: 64.0 },
        { type: 'Desktop', count: 852, pct: 36.0 }
      ]
    },
    purchaseIntent: {
      addedPct: 75.2, addedCount: 328, addBase: 436,
      boughtPct: 77.0, boughtCount: 124, orderBase: 161,
      influencedRevenue: 16740, influencedPct: 77.5, totalRevenue: 21600
    },
    search: {
      totalSearches: 3140,
      avgResults: 4.2,
      resultsDisplayed: 13188,
      carouselClickThrus: 2610,
      carouselCTR: 19.8,
      utterances: [
        { term: 'running shoes', count: 428 },
        { term: 'rain jacket', count: 356 },
        { term: 'denim jeans', count: 312 },
        { term: 'everyday tote', count: 268 },
        { term: 'wool socks', count: 214 },
        { term: 'hoodie', count: 187 },
        { term: 'backpack', count: 156 },
        { term: 'white sneakers', count: 142 }
      ],
      productImpressions: [
        { name: 'Aria Knit Sneaker', impressions: 1840, clicks: 512, ctr: 27.8 },
        { name: 'Cloudform Runner', impressions: 1520, clicks: 388, ctr: 25.5 },
        { name: 'Summit Trail Jacket', impressions: 1210, clicks: 274, ctr: 22.6 },
        { name: 'Classic Denim Straight', impressions: 1080, clicks: 246, ctr: 22.8 },
        { name: 'Everyday Tote', impressions: 890, clicks: 198, ctr: 22.2 },
        { name: 'Ridgeline Storm Shell', impressions: 760, clicks: 142, ctr: 18.7 },
        { name: 'Weekend Backpack', impressions: 640, clicks: 118, ctr: 18.4 },
        { name: 'Studio Hoodie', impressions: 520, clicks: 94, ctr: 18.1 }
      ]
    },
    productDetails: {
      detailViews: 2610,
      addToCartClicks: 176,
      addToCartRate: 6.7,
      products: [
        { name: 'Aria Knit Sneaker', views: 512, addToCarts: 38, atcRate: 7.4 },
        { name: 'Cloudform Runner', views: 388, addToCarts: 31, atcRate: 8.0 },
        { name: 'Summit Trail Jacket', views: 274, addToCarts: 18, atcRate: 6.6 },
        { name: 'Classic Denim Straight', views: 246, addToCarts: 26, atcRate: 10.6 },
        { name: 'Everyday Tote', views: 198, addToCarts: 16, atcRate: 8.1 },
        { name: 'Ridgeline Storm Shell', views: 142, addToCarts: 12, atcRate: 8.5 },
        { name: 'Weekend Backpack', views: 118, addToCarts: 9, atcRate: 7.6 },
        { name: 'Studio Hoodie', views: 94, addToCarts: 7, atcRate: 7.4 }
      ]
    },
    addToCart: {
      fromAgentInline: 260,
      fromPDP: 176,
      total: 436,
      avgValue: 58.40
    },
    comparison: {
      comparisons: 486,
      sessions: 236
    },
    cartView: {
      stages: [
        { label: 'Cart Views', count: 436, pct: 100 },
        { label: 'Checkout Click-Through', count: 262, pct: 60.1 },
        { label: 'Express Checkout Started', count: 138, pct: 31.7 },
        { label: 'Express Checkout Success', count: 118, pct: 27.1 }
      ],
      note: 'Funnel ends at 118 express-checkout completions. 161 total agent-assisted orders this week (see Checkout Method) — ties to 6.8% agent conversion on 2,368 sessions ($21,600 at $134.20 AOV).'
    }
  }
};
