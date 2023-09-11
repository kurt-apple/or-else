package models

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type DailyLog struct {
	///TODO: figure out best data type for date property
	ID               uint      `gorm:"primaryKey" json:"id"`
	UserID           uint      `json:"userID"`
	User             User      `gorm:"foreignKey:UserID"`
	LogDate          time.Time `json:"logDate"`
	TodaysRation     uint      `json:"todaysRation"`
	TodaysSampleRate uint      `json:"todaysSampleRate"`
}

func GetDailyLogs(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("getDailyLogs")
		var items []DailyLog
		db.Find(&items)
		fmt.Println(items)
		json.NewEncoder(w).Encode(items)
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

func CreateDailyLog(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createDailyLog:")
		var item DailyLog
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("DailyLog: ", item)
		db.Create(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateDailyLog(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item DailyLog
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
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