# DO NOT USE

the utmost caution needs to be taken to protect life and health. I built this for personal use. This is a dangerous app. I cannot recommend anybody use it.

# or-else

A Pavlovian torture bot. DO NOT USE. I will not be held liable.

# Behavior Change

Hunger is a potent catalyst for behavior change. Your brain wants you to survive, so if food becomes scarce, all sorts of new behavior may emerge in order to stay alive. As uncomfortable as it is to discuss, modern life dulls our survival instincts. Money buys food, but even if you run out of money, there are probably resources in your community to obtain food for free. There are safety nets built into society. By extension, our behavior is not dictated by any immediate basic need anymore. This presents its own set of challenges. Bad habits can be hard to break because it just doesn't feel meaningful enough to change. The only way to tap into this esoteric brain function is to emulate scarcity. I have built a "game" that helps you bring this onto yourself.

# Features and How To Use

- Set a `baseline daily ration` of x calories
- Add **habits** or **daily recurring tasks** to the main list.
- Each day, you will receive a sampling of the items in the list, comprised of your most frequently completed and/or your least frequently completed.
- The quantity of items sampled each day depends on the quantity of completed items on the previous day.
- Your ration is `baseline daily ration` \* `qty of completed habits yesterday` / `qty of sampled habits yesterday`
- optional: `baseline daily ration` varies depending on if you gain or lose weight the day prior - intended to calibrate `baseline` to prevent calorie deficit or surplus
- Set a minimum ration to prevent weird days with unforseen obligations from needlessly punishing you; not exactly the point of the game to punish you for things outside your control.

# Installation

## Find a Good Spot

Navigate to a directory you can clone a repo folder.
Clone the project into your folder of choice.

```bash
git clone git@github.com:kurt-apple/or-else.git or-else
```

Navigate into the project directory.

```bash
cd or-else
```

## Initialize the SQLite Database

Create a habits.db file in the main directory of the project.

```bash
touch habits.db
```

## Set Up The Client

Navigate to client folder and install dependencies. Yarn is recommended (by Quasar docs)

```bash
cd client
yarn
# or
npm install
```

## Start the app in development mode (hot-code reloading, error reporting, etc.)

### Run the Frontend

```bash
quasar dev
```

### Run the Backend (no hot reloading for Golang)

In another terminal window, navigate to the main directory of the project.

```bash
cd or-else
go run main.go
```

## Lint the Files

```bash
yarn lint
# or
npm run lint
```

## Format the Files

```bash
yarn format
# or
npm run format
```

## Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

# TODOs

- [x] left menu:
  - [x] Dashboard
  - [x] Habits List
  - [x] Daily Accomplishments
  - [x] Food Log
  - [x] Weight Log
  - [x] Settings
  - [x] Populate Icons and text fields with good data
    - [x] Mock the different menu pages and route to them
- [x] Dashboard
  - [x] Section for Most Consistent Habits - 95% completion rate threshold? user configurable
    - [x] Make user configuration
      - [x] Make default user on db (persisted)
      - [x] Prop up a first draft settings page
    - [x] Make getter for list
  - [x] Section for Top X habits to focus on (x) based on your activity level yesterday
    - [x] Make store for value X
    - [x] Make getter for list
    - [x] Nice cards in a list for each habit
    - [x] Click to expand other habits not in focus today
    - [x] Daily Logs
      - [x] Able to mark a habit complete for a given day
        - [x] From dashboard
          - [x] place headings and lists on their own lines
          - [x] make the timer create a new daily log on next tick > midnight if not exists
            - [x] allow for Create function to accept a subset of model properties OR make all other properties nullable
            - [x] fix timestamp 0 on new logs
          - [x] add checkbox on the habit
            - [x] map completion repo to index
              - [x] create completion repo
                - [x] on frontend
                - [x] on backend
                  - [x] create other necessary repos
                    - [x] daily log repo
                      - [x] on frontend
                      - [x] on backend
                  - [x] link habits to users from now on, even if it's just a default user
                    - [x] Make get_default_user getter on repo if possible
                    - [x] make ADD USER button in super page
                      - [x] better yet: add seeds to db
                    - [x] strip debug code in index
                    - [x] make ADD DEMO HABIT in habits page
            - [x] query completion repo for current user's complete habits for today
              - [x] add daily log repo (has many completions)
              - [x] add new daily log if it's a new day (compare today against last log's date)
                - [x] completions ought not be created until habit is complete for the day
                  - [x] get sampled habits needs to be dynamic on daily log
                    - [x] create default completions on log create
                  - [x] nevermind... completion needs that boolean
              - [x] seed daily log
                - [x] create daily log when new user is created
                  - [x] add startDate to user model and set it during creation
                    - [x] best date format for pinia orm stores?
                      - [x] Date objects (@Attr)
                    - [x] best way to handle dates for go and/or gorm?
                      - [x] time.Time
                        - [x] user model
                        - [x] dailylog model
                    - [x] best way to handle dates within sqlite?
                    - [x] set start date during creation
                  - [x] create new daily log on new user (in create function) //in seed right now; worry about auto generate on user create later.
              - [x] review hasMany and BelongsTo specifically for Pinia-ORM
              - [x] figure out how to generate completion logs when a daily log is made (go)
                - [x] figure out how to automatically sync to backend upon frontend state change
                  - [x] review pinia persisted state plugin offerings
                  - [x] use the axios functions, and in those functions, sync to local stores.
              - [x] re-seed
              - [x] completion entries need to be created when the daily log is
                - [x] check the Go seeds file to make sure habits -> log, no outdated completion entry creators.
              - [x] consider adding a null for completed boolean property
                - [x] completion entries need to properly link back to the Habit object, by habitId
                  - [x] figure out why computed getter lacks model properties
              - [x] track which habits were sampled when
                - [x] if sampled, specify habit as notcompleted instead of unspecified
                  - [x] pseudocode for resampling today (if user updates yesterday)
                    - [x] change user current sample rate to starting sample rate
                    - [x] validate daily log sample rate getter
                  - [x] refactor checkbox on all completions page
          - [-] add log date to completion records on dashboard
            - [-] convert dashboard to completion record lists?
              - [x] decide whether to bind checkbox to completion record status or to make the whole list just of completion records
                - [x] review getter (which query is simplest?)
                  - [x] dailylog getter for low CR habits must exclude future completion logs
                    - [x] habit needs a getter for completions prior to an input date
          - [x] habit card checkboxes need to properly set completion entry
          - [x] all completion ratio stuff needs to subtract today's sampling (so areas to improve isn't constantly restocked)
        - [-] From Daily Logs
          - [x] is daily log just dashboard?
        - [x] From Habits
    - [x] Habit Details Dialog
  - [ ] Section for Ration
    - [ ] How your ration was calculated
      - [x] FoodLogEntry model
        - [x] frontend
        - [x] backend
          - [x] Models
          - [x] Routing
          - [x] Seeds
            - [x] Draft
            - [x] Basic Test
      - [x] FoodItem model
        - [x] frontend
        - [x] backend
      - [x] page for all food log entries
        - [x] lower bound for actual and base rations in user settings
      - [x] page for food log form
        - [x] plus sign on food logs page
        - [x] button produces dummy data first
        - [x] then build a whole form
          - [x] blank page
          - [x] routing
          - [x] button redirects to form
          - [ ] form inputs
            - [x] date - default to latest log date
            - [x] fooditem - text
              - [x] top 3 most common foods as chips
              - [x] fuzzy search
            - [x] make unit of fooditem pop up once selected
            - [x] qty - text
              - [x] top 3 most common quantities as chips
          - [x] api call
    - [x] Progress toward ration today
    - [x] Baseline
- [ ] Habits List
  - [ ] Plus Sign to Add
- [ ] Add Habit Dialog
  - [ ] Title
  - [ ] Description - how to measure
    - [ ] add description to model
      - [ ] frontend
      - [ ] backend
  - [ ] Tags - could be useful for visualizations later on
- [ ] Daily Accomplishments
  - [ ] Graphs of completion statistics
  - [ ] Access the Logs of previous days
  - [ ] What the current Daily Log looks like
  - [ ] Place food log in Daily Log Entries
- [ ] Food Log
  - [ ] Put today's food in focus
  - [ ] Access prior food logs using a calendar
- [ ] Add Food Item to DB
  - [ ] Calories, Unit
  - [ ] Scrape MFP?
- [ ] Add Food Item To Daily Log
  - [ ] Item (with quick add)
  - [ ] QTY (pull units in from food item Model)
- [ ] Weight Log
  - [ ] Graph over time
  - [ ] Add weigh ins at any time (mind user-configured time zone)
  - [ ] future goal: integrate into withings
- [ ] Settings
  - [ ] Time Zone
  - [ ] Name
  - [ ] Completion Rate Threshold for Top Performers List
  - [ ] Max habits in focus per day
  - [ ] Baseline Calories
    - [ ] Basic Quiz to set default
  - [ ] Dynamic adjustment of calorie baseline (slide to enable)
  - [ ] authentication settings
- [ ] Authentication
  - [ ] have some
  - [ ] pin to lock ui?
- [ ] Styling
  - [ ] Toggle Dark Theme in Settings
- [ ] Create user should create first daily log
- [ ] stackblitz - pinia-orm find() and (where) on @belongsTo bug
- [ ] make it so you don't have to refresh the homepage
- [ ] make habits page so you don't have to refresh
- [ ] accordian on completion entries list
- [ ] times completed / times sampled shows as only 0 or 1
- [ ] label everything in settings page
- [ ] remove console logs that are stupid
