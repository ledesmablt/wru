# WRU

Prototype for an activity and location sharing app to know where and when your friends are working out.

## Why?
- Try [geohashing](https://youtu.be/M4lR_Va97cQ?t=825), tech stack ([create-t3-app](https://create.t3.gg/)), Supabase, and other APIs.
- Strava & other fitness apps I use tell me where people worked out but not their schedule. Thought it would be interesting to hack together something that does this.
- Prototype practice - crappy UI and missing some CRUD features but the integrations & core concepts are working.

## Intended usage
- Create an account with Google and link a calendar.
- Events & their locations from your "fitness" calendar will be visible to your followers. Events near you or your own events will be highlighted.
- You can make plans together, especially for people whose schedules and locations match up with yours!

## Existing features
- Google login
- Select & manually sync a GCal's events with locations
- Follow other people by email & see upcoming activities
- Highlight activities near me (same day, <5k radius)

## Other ideas
- Assign a type to each activity (running, biking, gym, swim, etc)
- Respond "going" to other activities
- Discover activities near me or popular activities + allow some events to be visible to non-followers
- Auto-sync GCal via cron
- Sync w/ Facebook and follow friends
- Show map in browser
