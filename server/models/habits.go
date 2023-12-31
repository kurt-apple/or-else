package models

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type Habit struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userID"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
}

func GetHabits(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var items []Habit
		db.Find(&items)
		if len(items) == 0 {
			w.WriteHeader(http.StatusNoContent)
		} else {
			json.NewEncoder(w).Encode(items)
		}
	}
}

func GetHabit(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item Habit
		db.First(&item, params["id"])
		json.NewEncoder(w).Encode(item)
	}
}

func CreateHabit(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createItem:")
		var item Habit
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("habit: ", item)
		db.Create(&item)
		// newEntry := Completion{
		// 	HabitID:    item.ID,
		// 	DailyLogID: Latest(db, item.UserID).ID,
		// 	Status:     CompletionStatus(Unspecified),
		// 	SampleType: HabitSampleType(NotSampled),
		// }
		// fmt.Println("generating new completion entry: ", newEntry, " whose latest daily log is ", newEntry.DailyLogID)
		// db.Create(&newEntry)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateHabit(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item Habit
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteHabit(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item Habit
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
