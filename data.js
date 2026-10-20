/* Site content: categories, services and sample stories. Edit freely. */
window.MVA_DATA=(()=>{
const SAMPLE=[
  {
    "category": "politics",
    "kind": "News update",
    "title": "Reading a county budget in five minutes",
    "dek": "A sample explainer showing how political coverage will look on the site.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1792476000000,
    "body": "Budget documents look dense, but most follow the same shape. They list where money comes from, what is spent on running costs, and what is set aside for development projects.\n\nStart with the development share. It shows how much is planned for roads, water, health facilities and other lasting assets, rather than salaries and day-to-day costs.\n\nThen compare the plan with the previous year. Large jumps, new line items and projects that were promised but are missing are all worth a follow-up question to the officials responsible.",
    "sample": true
  },
  {
    "category": "business",
    "kind": "Feature",
    "title": "Small traders and the mobile-money economy",
    "dek": "A sample feature about how everyday business runs on a phone.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1792414800000,
    "body": "Walk through any market and you will see the same sign: a till number taped to a stall. Payments that once needed cash and change now move in seconds between phones.\n\nFor small traders that changes how they keep records, pay suppliers and prove their income when they apply for credit.\n\nThe story to report is not the technology itself but the habits around it: who benefits, who is still left out, and what it costs to move money in and out.",
    "sample": true
  },
  {
    "category": "agriculture",
    "kind": "Blog",
    "title": "Planning a planting calendar around the rains",
    "dek": "A sample blog post in the agriculture desk's voice.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1792310400000,
    "body": "Every farming season starts with a decision about timing. Plant too early and young crops can be lost to a dry spell. Plant too late and the harvest shrinks.\n\nFarmers compare forecasts from the weather service with what they see in their own fields, and many keep simple notes from one season to the next.\n\nA good planting calendar lists the crop, the expected rains, the date to prepare the land and the date to review the plan if conditions change.",
    "sample": true
  },
  {
    "category": "social",
    "kind": "Opinion",
    "title": "What community radio still does better than apps",
    "dek": "A sample opinion piece from the social desk.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1792234800000,
    "body": "Apps promise reach, yet a local radio station can reach a whole village at the same time, in the language people use at home.\n\nIt carries notices about burials, clinic days and school closures that never trend online but matter to the people who hear them.\n\nDigital media should learn from that: serve a specific place, speak plainly and be there every day.",
    "sample": true
  },
  {
    "category": "tech",
    "kind": "Blog",
    "title": "Why newsrooms are building for the phone first",
    "dek": "A sample post on mobile-first publishing.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1792134000000,
    "body": "Most readers in the region open news on a phone, often on a slow connection and often with limited data.\n\nThat shapes everything: short pages that load fast, headlines that make sense on a small screen, images that are compressed and video that starts only when the reader asks for it.\n\nBuilding for the phone first is a discipline. It forces a newsroom to decide what actually matters in a story.",
    "sample": true
  },
  {
    "category": "sports",
    "kind": "News update",
    "title": "Match-day notes: how we file live updates",
    "dek": "A sample template for quick sports updates.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1792076400000,
    "body": "Live updates work best when each one stands alone. State the time, the event and the score, then add one line of context.\n\nEditors keep a running summary at the top of the page so a reader who arrives late understands the match in ten seconds.\n\nAfter the final whistle, the updates are folded into a single report with the key moments, the result and what comes next.",
    "sample": true
  },
  {
    "category": "environment",
    "kind": "Feature",
    "title": "Water, land and the long rains: a field-notes format",
    "dek": "A sample long-form layout for environment reporting.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1791968400000,
    "body": "Environment stories are often about slow change. A river that runs lower each year or a hillside that erodes after heavy rain does not make a single dramatic headline.\n\nField notes help. Record the place, the date, who you spoke to and what you measured or saw, so that readers can follow the change across seasons.\n\nThen explain what people are doing about it, and what remains unresolved.",
    "sample": true
  },
  {
    "category": "business",
    "kind": "News update",
    "title": "Markets brief: the format for our daily economy note",
    "dek": "A sample of the short daily business update.",
    "author": "Newsroom desk (sample)",
    "createdAt": 1791867600000,
    "body": "The daily note opens with the three things a reader needs before the working day starts: what moved, why it moved and what is scheduled today.\n\nEach item links to the full story and names its source, whether a company statement, a regulator or official data.\n\nKeeping the format steady lets readers scan it quickly and trust where to look.",
    "sample": true
  }
];
const CATS=[
 {id:"politics",name:"Politics",c:"#ec3228"},
 {id:"business",name:"Business & Economy",c:"#f2b01e"},
 {id:"agriculture",name:"Agriculture",c:"#3fb56b"},
 {id:"social",name:"Social & Society",c:"#4c8df6"},
 {id:"tech",name:"Tech & Innovation",c:"#a66cff"},
 {id:"sports",name:"Sports",c:"#ff7a3d"},
 {id:"environment",name:"Environment",c:"#1fb5aa"}];
const CAT=Object.fromEntries(CATS.map(c=>[c.id,c]));
const SERVICES=[
 {id:"digital",name:"Digital Media Services",sub:"Content, social and web that work on a phone screen.",
  text:"We produce and publish digital content with newsroom discipline: sharp writing, clean visuals and a clear point of view for every platform you use.",
  items:["Video and photo production","Social media management","Digital campaigns","Web and blog content","Podcasts and audio","Content calendars"]},
 {id:"events",name:"Events & Media Coverage",sub:"Photo, video and written coverage of the moments that matter.",
  text:"Our crews cover corporate and social events from the first guest to the final speech, then deliver stories, photos and highlight reels while the event is still being talked about.",
  items:["Corporate events and conferences","Product launches","Press conferences and briefings","Social events and celebrations","Community and cultural events","Live streaming and live updates","Photo galleries and highlight reels","Post-event reports and press coverage"]},
 {id:"pr",name:"Public Relations",sub:"Earn attention from editors, partners and the public.",
  text:"Our PR team writes, pitches and prepares you for the media, from a single press release to a full reputation programme.",
  items:["Media relations","Press releases and statements","Event publicity","Crisis communication","Reputation monitoring","Spokesperson briefing"]},
 {id:"consult",name:"Communication Consultancy",sub:"Strategy and messaging that people understand.",
  text:"We help organisations decide what to say, to whom and through which channels, then train teams to deliver it.",
  items:["Communication strategy","Brand messaging","Stakeholder engagement","Media training","Communication audits","Internal communication"]}];
return {SAMPLE,CATS,CAT,SERVICES};
})();
