package seeds

import (
	"bufio"
	"fmt"
	"or-else/models"
	"os"
	"time"

	"gorm.io/gorm"
)

func ExampleSeedDatabase(db *gorm.DB, interfaces []interface{}) error {
	fmt.Print("Would you like to reset and seed the db using example.go? (y/n): ")
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
		StartDate:               time.Now(),
		MinRation:               1200,
		MinWeight:               160,
	}

	fmt.Println("pushing default user to db")
	db.Create(&defaultUser)
	fmt.Println("default user now has ID ", defaultUser.ID)

	defaultHabit := models.Habit{
		UserID: defaultUser.ID,
		Title:  "Use this app OR ELSE",
	}

	fmt.Println("pushing default habits to db")
	db.Create(&defaultHabit)

	firstDailyLog := models.DailyLog{
		UserID:     defaultUser.ID,
		LogDate:    defaultUser.StartDate,
		BaseRation: defaultUser.StartingRation,
	}

	fmt.Println("pushing first daily log - should auto generate completion entries")
	models.CreateLog(db, &firstDailyLog)

	fmt.Println("pushing some food items")
	firstFood := models.FoodItem{
		Name:            "Apple",
		Unit:            "EA",
		CaloriesPerUnit: 90,
	}
	db.Create(&firstFood)

	fmt.Println("Database reset and re-seeded successfully.")
	return nil
}
