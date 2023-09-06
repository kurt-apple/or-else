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
- Your ration is `baseline daily ration` * `qty of completed habits yesterday` / `qty of sampled habits yesterday`
- optional: `baseline daily ration` varies depending on if you gain or lose weight the day prior - intended to calibrate `baseline` to prevent calorie deficit or surplus
- Set a minimum ration to prevent weird days with unforseen obligations from needlessly punishing you; not exactly the point of the game to punish you for things outside your control.

# Installation
Navigate to a directory you can clone a repo folder.
Clone the project into your folder of choice.
`git clone git@github.com:kurt-apple/or-else.git or-else`
Navigate into the project directory.
`cd or-else`
Create a habits.db file in the main directory of the project.
`touch habits.db`
Navigate to client folder and install packages. Yarn is recommended (by Quasar docs)
`cd client`
`yarn`
Run the frontend.
`quasar dev`
In another terminal window, navigate to the main directory of the project.
`cd or-else`
Run the backend.
`go run main.go`
