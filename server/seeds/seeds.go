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
	fmt.Print("Would you like to reset and seed the db? (y/n): ")
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
		StartDate:               time.Now().AddDate(0, 0, -3),
	}

	fmt.Println("pushing default user to db")
	db.Create(&defaultUser)
	fmt.Println("default user now has ID ", defaultUser.ID)

	defaultHabits := []models.Habit{}
	for i := uint8(1); i <= 100; i += 2 {
		defaultHabits = append(defaultHabits, models.Habit{
			UserID: defaultUser.ID,
			Title:  "Randomized Habit " + fmt.Sprint(i),
		})
	}

	fmt.Println("pushing default habits to db")
	for _, habit := range defaultHabits {
		db.Create(&habit)
	}

	firstDailyLog := models.DailyLog{
		UserID:            defaultUser.ID,
		LogDate:           defaultUser.StartDate,
		RationStoredValue: defaultUser.StartingRation,
	}

	secondDailyLog := models.DailyLog{
		UserID:            defaultUser.ID,
		LogDate:           defaultUser.StartDate.AddDate(0, 0, 1),
		RationStoredValue: defaultUser.StartingRation,
	}

	fmt.Println("pushing first daily log - should auto generate completion entries")
	models.CreateLog(db, &firstDailyLog)
	secondDailyLog.PreviousLogID = firstDailyLog.ID
	models.CreateLog(db, &secondDailyLog)

	fmt.Println("pushing some food items")
	fakeFoods := []models.FoodItem{}
	for i := uint8(1); i <= 10; i += 1 {
		fakeFoods = append(fakeFoods, models.FoodItem{
			Name:            "Yummy Treat " + fmt.Sprint(i),
			Unit:            "Quart",
			CaloriesPerUnit: i * 100,
		})
	}
	for _, foodItem := range fakeFoods {
		db.Create(&foodItem)
	}

	fmt.Println("pushing one food log")
	log := models.FoodEntry{
		DailyLogID: firstDailyLog.ID,
		FoodItemID: fakeFoods[4].ID,
		QTY:        2,
	}
	db.Create(&log)

	fmt.Println("Database reset and re-seeded successfully.")
	return nil
}
