package models

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type Completion struct {
	///TODO: figure out best data type for date property
	ID         uint `gorm:"primaryKey" json:"id"`
	HabitID    uint `json:"habitID"`
	DailyLogID uint `json:"dailyLogID"`
	Completed  bool `json:"completed"`
}

func GetCompletions(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("getCompletions")
		var items []Completion
		db.Find(&items)
		fmt.Println(items)
		json.NewEncoder(w).Encode(items)
	}
}

func GetCompletion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item Completion
		db.First(&item, params["id"])
		json.NewEncoder(w).Encode(item)
	}
}

func CreateCompletion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createCompletion:")
		var item Completion
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("Completion: ", item)
		db.Create(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateCompletion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item Completion
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteCompletion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item Completion
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
