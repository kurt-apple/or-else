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
		CurrentSampleRate:       2,
		TimeZoneOffset:          -8,
		StartingRation:          2000,
		StartDate:               time.Now(),
	}

	defaultHabits := []models.Habit{}
	for i := uint8(1); i <= 100; i += 2 {
		defaultHabits = append(defaultHabits, models.Habit{
			UserID:         uint(1),
			Title:          "Another Default Habit",
			TimesSampled:   100,
			TimesCompleted: i,
		})
	}

	firstDailyLog := models.DailyLog{
		UserID:           defaultUser.ID,
		LogDate:          defaultUser.StartDate,
		TodaysRation:     defaultUser.StartingRation,
		TodaysSampleRate: defaultUser.CurrentSampleRate,
	}

	fmt.Println("pushing default user to db")
	db.Create(&defaultUser)

	fmt.Println("pushing default habits to db")
	for _, habit := range defaultHabits {
		db.Create(&habit)
	}

	fmt.Println("pushing first daily log")
	db.Create(&firstDailyLog)

	fmt.Println("Database reset and re-seeded successfully.")
	return nil
}
