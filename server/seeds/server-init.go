package seeds

import (
	"fmt"
	"or-else/models"
	"time"

	"gorm.io/gorm"
)

func DBInit(db *gorm.DB, interfaces []interface{}) {
	fmt.Print("Running initialize check")
	fmt.Print("AutoMigrate will not perform destructive data transforms, only create new columns and tables")
	// from GORM docs:
	// > SQLite doesn’t support ALTER COLUMN, DROP COLUMN, GORM will create a new table as the one you are trying to change, copy all data, drop the old table, rename the new table
	db.AutoMigrate(interfaces...)

	// initialization of the defaultiest default
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

	// DEFAULT USER
	var user models.User
	userSearchResult := db.Where("name = ?", "You").First(&user)
	if userSearchResult.Error != nil {
		if userSearchResult.Error == gorm.ErrRecordNotFound {
			// Handle the case where no record is found
			fmt.Println("Creating the default user.")
			models.MakeUser(db, &defaultUser)
		} else {
			// Handle other errors
			fmt.Println("Oh no.")
			panic(userSearchResult.Error)
		}
	}

	// rely on the db record of the default user in case settings have been changed.
	userSearchResult = db.Where("name = ?", "You").First(&defaultUser)
	if userSearchResult.Error != nil {
		if userSearchResult.Error == gorm.ErrRecordNotFound {
			panic("Attempted to create the default user and failed.")
		} else {
			panic(userSearchResult.Error)
		}
	}

	// FIRST DAILY LOG
	var dailyLog models.DailyLog
	dailyLogSearchResult := db.First(&dailyLog)
	if dailyLogSearchResult.Error != nil {
		if dailyLogSearchResult.Error == gorm.ErrRecordNotFound {
			fmt.Println("Creating the first daily log for the default user.")
			firstDailyLog := models.DailyLog{
				UserID:        defaultUser.ID,
				LogDate:       time.Now(),
				BaseRation:    defaultUser.StartingRation,
				PreviousLogID: 0,
				LastModified:  time.Now(),
			}
			dlresult := db.Create(&firstDailyLog)
			if dlresult.Error != nil {
				fmt.Println("Error creating the first daily log.")
				fmt.Println(dlresult.Error.Error())
			}
		} else {
			panic(dailyLogSearchResult.Error)
		}
	}
}
