// Full verse + contextual explanation for each category's scripture panel

export const SCRIPTURE_PANELS = {
  wars: {
    verse: '"You will hear of wars and rumors of wars, but see to it that you are not alarmed. Such things must happen, but the end is still to come. Nation will rise against nation, and kingdom against kingdom."',
    ref: 'Matthew 24:6–7',
    explanation:
      'Jesus listed escalating international conflict as among the first "birth pains" — signs that increase in frequency and severity as the age draws to a close. The phrase "nation against nation, kingdom against kingdom" suggests both state-level warfare and broader geopolitical breakdown. This indicator tracks global armed conflict events and the nuclear threat level, rising when the number or intensity of active wars deviates significantly above historical norms.',
  },
  earthquakes: {
    verse: '"There will be famines and earthquakes in various places. All these are the beginning of birth pains."',
    ref: 'Matthew 24:7–8',
    explanation:
      'The phrase "in various places" is key — it implies geographic spread, not merely frequency. Isolated earthquakes have always occurred; the prophetic sign is simultaneous seismic activity across multiple regions. This indicator measures M6.0+ earthquake counts against a 50-year USGS historical baseline, scoring higher when both the frequency and distribution of significant quakes exceed what history considers normal. The "birth pains" metaphor further implies acceleration over time.',
  },
  famine: {
    verse: '"When the Lamb opened the third seal, I heard the third living creature say, \'Come!\' I looked, and there before me was a black horse! Its rider was holding a pair of scales in his hand. Then I heard what sounded like a voice among the four living creatures, saying, \'Two pounds of wheat for a day\'s wages, and six pounds of barley for a day\'s wages, and do not damage the oil and the wine!\'"',
    ref: 'Revelation 6:5–6',
    explanation:
      'The black horse of the third seal symbolizes scarcity and economic distress tied to food — a day\'s wage buying only enough grain to survive. Famine in Scripture is not merely natural disaster but a systemic breakdown of the food supply. This indicator tracks UN OCHA (ReliefWeb) reports of food crisis, famine declarations, and acute food insecurity over a 90-day window, rising when humanitarian agencies are issuing more distress signals than historical norms.',
  },
  pestilence: {
    verse: '"There will be great earthquakes, famines and pestilences in various places, and fearful events and great signs from heaven."',
    ref: 'Luke 21:11',
    explanation:
      'The Greek word λοιμοί (loimoi), translated "pestilences," refers to epidemic or pandemic disease — mass-casualty contagion. Revelation 6:8 pairs pestilence with death directly: "power was given them over a fourth of the earth to kill by sword, famine, plague, and by the wild beasts of the earth." This indicator monitors the WHO Disease Outbreak News feed, counting active disease events over 60 days and weighting high-severity pathogens — novel viruses, hemorrhagic fevers, or declared public health emergencies — more heavily.',
  },
  disasters: {
    verse: '"There will be signs in the sun, moon and stars. On the earth, nations will be in anguish and perplexity at the roaring and tossing of the sea."',
    ref: 'Luke 21:25',
    explanation:
      'Luke pairs cosmic disturbances with terrestrial ones — the "roaring of the sea" evokes catastrophic flooding, storms, and uncontrollable natural forces that cause widespread human anguish. The passage conveys a world where natural systems seem to be destabilizing simultaneously. This indicator draws on the GDACS (Global Disaster Alert and Coordination System) live feed, scoring current active alerts by severity — Red alerts represent the most destructive ongoing events, Orange are significant, and Green are elevated but manageable.',
  },
  cosmic: {
    verse: '"Immediately after the distress of those days \'the sun will be darkened, and the moon will not give its light; the stars will fall from the sky, and the heavenly powers will be shaken.\'"',
    ref: 'Matthew 24:29',
    explanation:
      'Cosmic signs appear throughout biblical prophecy — from Joel 2:31 ("the sun will be turned to darkness and the moon to blood") to Revelation 6:12–13 ("the sun turned black... the moon turned blood red... and the stars in the sky fell to earth"). Whether interpreted literally or as apocalyptic imagery, these passages point to extraordinary disruptions in the heavens. This indicator combines NOAA solar storm data (Kp-index → G-scale) with NASA\'s Near-Earth Object feed, tracking geomagnetic storms powerful enough to darken the grid and asteroids making unusually close passes.',
  },
  moral: {
    verse: '"But mark this: There will be terrible times in the last days. People will be lovers of themselves, lovers of money, boastful, proud, abusive, disobedient to their parents, ungrateful, unholy, without love, unforgiving, slanderous, without self-control, brutal, not lovers of the good, treacherous, rash, conceited, lovers of pleasure rather than lovers of God — having a form of godliness but denying its power."',
    ref: '2 Timothy 3:1–5',
    explanation:
      'Paul\'s description reads like a sociological profile of advanced moral individualism: self-centeredness elevated to a cultural virtue, pleasure as the highest good, and religion reduced to aesthetic form without transformative power. Jesus adds in Matthew 24:12, "Because of the increase of wickedness, the love of most will grow cold." This indicator uses trend data from global rule-of-law indices, violent crime rates, and social trust surveys — prioritizing the direction of change over absolute levels, since the text emphasizes increase.',
  },
  persecution: {
    verse: '"Then you will be handed over to be persecuted and put to death, and you will be hated by all nations because of me."',
    ref: 'Matthew 24:9',
    explanation:
      'Persecution of believers is one of Jesus\'s clearest end-times markers — and it is specifically global in scope ("all nations"), not regional. The Open Doors World Watch List documents that Christian persecution is currently at historically high levels, with over 360 million Christians facing high levels of persecution or discrimination worldwide. This indicator uses annual Open Doors data on the number of countries with high or extreme persecution and the estimated number of believers killed, displaced, or imprisoned for their faith.',
  },
  apostasy: {
    verse: '"Don\'t let anyone deceive you in any way, for that day will not come until the rebellion occurs and the man of lawlessness is revealed, the man doomed to destruction."',
    ref: '2 Thessalonians 2:3',
    explanation:
      'The Greek word ἀποστασία (apostasia) — "rebellion" or "falling away" — refers specifically to a departure from established faith within the church, not merely unbelief in the world. Paul pairs it with the revelation of the Antichrist, suggesting it is both a precursor and an enabler. This indicator tracks the Joshua Project\'s unreached people group data (gospel coverage) alongside Pew Research surveys measuring self-identified Christian decline in historically Christian nations — watching both the spread of the gospel and the institutional collapse of Western Christianity simultaneously.',
  },
  israel: {
    verse: '"Now learn this lesson from the fig tree: As soon as its twigs get tender and its leaves come out, you know that summer is near. Even so, when you see all these things, you know that it is near, right at the door. Truly I tell you, this generation will certainly not pass away until all these things have happened."',
    ref: 'Matthew 24:32–34',
    explanation:
      'The fig tree has long been interpreted as a symbol of Israel (cf. Hosea 9:10, Jeremiah 24). The rebirth of Israel as a nation in 1948 — after nearly 2,000 years of diaspora — is widely regarded as the most significant prophetic fulfillment in modern history. Zechariah 12 describes Jerusalem becoming "a cup that sends all the surrounding peoples reeling" and a "immovable rock for all the nations" in the last days. This indicator tracks active military conflict involving Israel, the degree of international isolation (UN votes), and developments around the Temple Mount.',
  },
}
