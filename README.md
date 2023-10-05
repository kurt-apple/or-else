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
  - [x] Section for Ration
    - [x] How your ration was calculated
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
          - [x] form inputs
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
- [x] Habits List
  - [x] Plus Sign to Add
- [L] Add Habit Dialog (detail dialog with props)
  - [x] Title
  - [L] Description - how to measure
    - [L] add description to model
      - [L] frontend
      - [L] backend
  - [L] Tags - could be useful for visualizations later on
- [L] Daily Accomplishments
  - [L] Graphs of completion statistics
  - [L] Access the Logs of previous days
  - [L] What the current Daily Log looks like
  - [L] Place food log in Daily Log Entries
- [L] Food Log
  - [x] Put today's food in focus
  - [L] Access prior food logs using a calendar
- [x] Add Food Item to DB
  - [x] Calories, Unit
  - [L] Scrape MFP?
- [x] Add Food Item To Daily Log
  - [x] Item (with quick add)
  - [x] QTY (pull units in from food item Model)
- [L] Weight Log
  - [L] Graph over time
  - [x] Add weigh ins at any time (mind user-configured time zone)
  - [L] future goal: integrate into withings
- [L] Settings
  - [L] Time Zone
  - [L] Name
  - [x] Completion Rate Threshold for
        Top Performers List
  - [-] Max habits in focus per day
  - [x] Baseline Calories
    - [-] Basic Quiz to set default
  - [-] Dynamic adjustment of calorie baseline (slide to enable)
  - [L] authentication settings
- [L] Authentication
  - [L] have some
  - [L] pin to lock ui?
- [L] Styling
  - [L] Toggle Dark Theme in Settings
- [x] Create user should create first daily log
- [L] stackblitz - pinia-orm find() and (where) on @belongsTo bug
- [x] make it so you don't have to refresh the homepage
- [L] make habits page so you don't have to refresh
- [x] accordian on completion entries list
- [x] times completed / times sampled shows as only 0 or 1
  - [x] when a new habit is marked complete, times_sampled does not go up but times_completed does which leads to confusion.
    - [x] separate internal vs external times_completed. (external would not ignore today's status whereas internal would in order to prevent re-sampling)
- [x] label everything in settings page
- [x] remove console logs that are stupid
- [x] display something for 0% ration progress instead of blank screen
- [x] make fill color for remaining portion of ration visualizer
- [L] auto form generation
- [L] habit createdDate to avoid rewriting history on resamples
- [L] make habit page reactive on create or update
  - [L] try inlining the dialog NOT using dialog plugin
- [L] configure API and stores to only store one user's information
- [x] try to have dialog pass payload back to parent component when creating or updating.
- [x] add food item
- [x] add custom pretty components to completion entries tree again
- [x] add text next to or inside the Ration graph on dashboard
- [x] remove status text near info button on habits list component
- [x] rename \*'Card' components
- [x] remove 2 way binding on ration graph
- [x] make a custom card for each daily log in the daily logs screen
- [-] paginate (tables?)
- [L] edit button on All Food Entries
- [x] Tree view in All Food Entries
- [L] make the tree view component generic so I can use it in other areas of the app
- [x] try force refresh for dialogs
  - [L] try not using the dialog plugin to create a dialog
- [x] "top 3 most common quantities" can be only shown on the condition that there are some records for that food item.
- [x] "top 3" needs to instead be the "top X" where x = min(records array length, 3)
- [x] implement reset on the food entry form
- [-] add edit/details functionality on the food items list
- [x] weigh-in input needs the up/down arrows of an input of type number
- [ ] set minimum weight
  - [x] ensure it is in backend model
  - [x] ensure it is in frontend model
  - [x] add setting to settings page
  - [ ] add logic to ration calculation
- [ ] make sure auto sizing actual ration works
- [ ] add weight to all daily logs table
- [ ] daily logs: use a table instead?
- [ ] auto adjust calories based on conformity to ration
- [ ] add ration back in to daily log record. prevent resampling of old rations.
- [ ] sample rate must consist of the total improved habits from yesterday plus one, plus any additional that today was logged.
  - [ ] have a function on the completion stores repo to determine if a habit was either sampled or taken off indeterminate
    - [ ] store sampled y/n on completion entry records. ugh.
