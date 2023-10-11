package seeds

// import (
// 	"bufio"
// 	"fmt"
// 	"or-else/models"
// 	"os"
// 	"time"

// 	"gorm.io/gorm"
// )

// func PrivateSeedDatabase(db *gorm.DB, interfaces []interface{}) error {
// 	fmt.Print("Would you like to reset and seed the db using example.go? (y/n): ")
// 	scanner := bufio.NewScanner(os.Stdin)
// 	scanner.Scan()
// 	input := scanner.Text()

// 	if input != "y" && input != "Y" {
// 		fmt.Println("Database seeding aborted.")
// 		return nil
// 	}

// 	fmt.Println("dropping tables")
// 	db.Migrator().DropTable(interfaces...)
// 	fmt.Println("creating tables")
// 	db.AutoMigrate(interfaces...)
// 	fmt.Println("generating models locally")
// 	defaultUser := models.User{
// 		Name:                    "ME",
// 		CompletionRateThreshold: 0.95,
// 		StartingSampleRate:      2,
// 		TimeZoneOffset:          0,
// 		StartingRation:          1900,
// 		MinRation:               1200,
// 		MinWeight:               155,
// 		StartingWeight:          175,
// 	}

// 	fmt.Println("pushing default user to db")
// 	models.MakeUser(db, &defaultUser)
// 	fmt.Println("default user now has ID ", defaultUser.ID)

// 	defaultHabitTitles := []string{
// 		"Wake up on the first alarm",
// 		"15m cardio",
// 		"Eat your veggies",
// 		"Study",
// 		"Journal",
// 	}

// 	defaultHabits := []models.Habit{}
// 	for i := 0; i < len(defaultHabitTitles); i++ {
// 		defaultHabits = append(defaultHabits, models.Habit{
// 			UserID: defaultUser.ID,
// 			Title:  defaultHabitTitles[i],
// 		})
// 	}

// 	fmt.Println("pushing default habits to db")
// 	for _, habit := range defaultHabits {
// 		db.Create(&habit)
// 	}

// 	firstDailyLog := models.DailyLog{
// 		UserID:        defaultUser.ID,
// 		LogDate:       time.Now(),
// 		BaseRation:    defaultUser.StartingRation,
// 		PreviousLogID: 0,
// 		LastModified:  time.Now(),
// 	}
// 	db.Create(&firstDailyLog)

// 	fmt.Println("pushing first daily log - frontend now generates completion entries so we do it manually here to seed.")

// 	for _, habit := range defaultHabits {
// 		newEntry := models.Completion{
// 			HabitID:    habit.ID,
// 			DailyLogID: firstDailyLog.ID,
// 			Status:     models.Unspecified,
// 			SampleType: models.NotSampled,
// 		}
// 		db.Create(&newEntry)
// 	}

// 	fmt.Println("pushing some food items")
// 	firstFood := models.FoodItem{
// 		Name:            "Apple",
// 		Unit:            "EA",
// 		CaloriesPerUnit: 90,
// 	}
// 	db.Create(&firstFood)

// 	firstFoodEntry := models.FoodEntry{
// 		DailyLogID: firstDailyLog.ID,
// 		FoodItemID: firstFood.ID,
// 		QTY:        0.5,
// 	}
// 	db.Create(&firstFoodEntry)

// 	firstWeightEntry := models.WeightEntry{
// 		DailyLogID: firstDailyLog.ID,
// 		Time:       time.Now().Add(time.Millisecond),
// 		Weight:     defaultUser.StartingWeight,
// 	}
// 	fmt.Println("pushing a weight log")
// 	db.Create(&firstWeightEntry)

// 	fmt.Println("Database reset and re-seeded successfully.")
// 	return nil
// }
