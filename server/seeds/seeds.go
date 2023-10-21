package seeds

import (
	"bufio"
	"fmt"
	"or-else/models"
	"os"
	"time"

	"gorm.io/gorm"
)

//0. on launch, ask user if they would like a reset of db
//1. add default user (ID 1)
//2. add default habits (0.1 cr to 1.0 cr)

func SeedDatabase(db *gorm.DB, interfaces []interface{}) error {
	fmt.Print("Would you like to reset and seed the db using test payload from seeds.go? (y/n): ")
	// Read user input
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	input := scanner.Text()

	if input != "y" && input != "Y" {
		fmt.Println("Database seeding aborted.")
		return nil
	}

	fmt.Println("dropping tables")
	db.Migrator().DropTable(interfaces...)
	fmt.Println("creating tables")
	db.AutoMigrate(interfaces...)
	fmt.Println("generating models locally")
	defaultUser := models.User{
		Name:                    "DEFAULT",
		CompletionRateThreshold: 0.95,
		StartingSampleRate:      2,
		TimeZoneOffset:          -8,
		StartingRation:          2000,
		CreatedAt:               time.Now().AddDate(0, 0, -3),
		MinRation:               1500,
		MinWeight:               200,
		StartingWeight:          200,
	}

	fmt.Println("pushing default user to db")
	models.MakeUser(db, &defaultUser)
	fmt.Println("default user now has ID ", defaultUser.ID)

	defaultHabits := []models.Habit{}
	for i := uint8(1); i <= 100; i += 7 {
		defaultHabits = append(defaultHabits, models.Habit{
			UserID: defaultUser.ID,
			Title:  "Randomized Habit " + fmt.Sprint(i),
		})
	}

	fmt.Println("pushing default habits to db")
	for _, habit := range defaultHabits {
		db.Create(&habit)
	}

	firstDailyLog := models.Latest(db, defaultUser.ID)

	fmt.Println("pushing first daily log - the client is responsible for creating completion entries typically.")
	models.CreateLog(db, &firstDailyLog)

	fmt.Println("pushing some food items")
	fakeFoods := []models.FoodItem{}
	for i := uint(1); i <= 10; i += 1 {
		foodItem := models.FoodItem{
			Name:            "Yummy Treat " + fmt.Sprint(i),
			Unit:            "Quart",
			CaloriesPerUnit: i * 100,
		}
		db.Create(&foodItem)
		fakeFoods = append(fakeFoods, foodItem)
	}

	fmt.Println("pushing one food log")
	log := models.FoodEntry{
		DailyLogID: firstDailyLog.ID,
		FoodItemID: fakeFoods[0].ID,
		QTY:        2,
	}
	db.Create(&log)
	fmt.Println(log.FoodItemID)

	fmt.Println("generating weight entries")
	t := firstDailyLog.LogDate
	for i := 1; i <= 10; i += 1 {
		t = t.Add(time.Hour)
		entry := models.WeightEntry{
			DailyLogID: firstDailyLog.ID,
			Weight:     180,
			Time:       t,
		}
		db.Create(&entry)
	}

	fmt.Println("Database reset and re-seeded successfully.")
	return nil
}
