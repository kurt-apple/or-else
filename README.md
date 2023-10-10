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
