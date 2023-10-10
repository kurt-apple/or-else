package models

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type DailyLog struct {
	///TODO: figure out best data type for date property
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"userID"`
	User          User      `gorm:"foreignKey:UserID"`
	LogDate       time.Time `json:"logDate"`
	BaseRation    uint      `json:"baseRation"`
	PreviousLogID uint      `json:"previousLogID"`
	LastModified  time.Time `json:"lastModified"`
}

func GetDailyLogs(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("getDailyLogs")
		var items []DailyLog
		db.Find(&items)
		if len(items) == 0 {
			w.WriteHeader(http.StatusNoContent)
		} else {
			json.NewEncoder(w).Encode(items)
		}
	}
}

func GetDailyLog(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item DailyLog
		db.First(&item, params["id"])
		json.NewEncoder(w).Encode(item)
	}
}

func Latest(db *gorm.DB, UserID uint) DailyLog {
	var logs []DailyLog
	db.Find(&logs)
	sort.Slice(logs, func(i, j int) bool {
		return logs[i].LogDate.After(logs[j].LogDate)
	})
	return logs[0]
}

func CreateLog(db *gorm.DB, dl *DailyLog) {
	dl.LastModified = time.Now()
	fmt.Println("createLog", dl)
	db.Create(dl)
	var habits []Habit
	db.Where(&Habit{UserID: dl.UserID}).Find(&habits)
	for _, habit := range habits {
		completion := &Completion{
			HabitID:    habit.ID,
			DailyLogID: dl.ID,
			Status:     CompletionStatus(Unspecified),
			SampleType: HabitSampleType(NotSampled),
		}
		db.Create(completion)
	}
}

func CreateDailyLog(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createDailyLog:")
		var item DailyLog
		json.NewDecoder(r.Body).Decode(&item)
		CreateLog(db, &item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateDailyLog(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item DailyLog
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		item.LastModified = time.Now()
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteDailyLog(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item DailyLog
		result := db.First(&item, params["id"])
		if result.Error != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode("Item not found")
			return
		}
		if err := db.Delete(&item).Error; err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode("Failed to delete item")
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode("Item Deleted")
	}
}
