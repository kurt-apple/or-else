package main

import (
	"fmt"
	"log"
	"or-else/models"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

func main() {
	db, err = gorm.Open(sqlite.Open("habits.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		sqlDB, _ := db.DB()
		_ = sqlDB.Close()
	}()

	listOfModels := []interface{}{&models.Habit{}, &models.User{}, &models.DailyLog{}, &models.Completion{}, &models.FoodEntry{}, &models.FoodItem{}, &models.WeightEntry{}}
	fmt.Println("Initializing New DB")
	db.AutoMigrate(listOfModels...)
	defaultUser := models.User{
		Name:                    "You",
		CompletionRateThreshold: 0.95,
		StartingSampleRate:      2,
		TimeZoneOffset:          -8,
		StartingRation:          2000,
		CreatedAt:               time.Now().AddDate(0, 0, -3),
		MinRation:               1500,
		MinWeight:               200,
		StartingWeight:          200,
	}
	models.MakeUser(db, &defaultUser)
	firstDailyLog := models.DailyLog{
		UserID:        defaultUser.ID,
		LogDate:       time.Now(),
		BaseRation:    defaultUser.StartingRation,
		PreviousLogID: 0,
		LastModified:  time.Now(),
	}
	db.Create(&firstDailyLog)
	models.CreateLog(db, &firstDailyLog)
}
