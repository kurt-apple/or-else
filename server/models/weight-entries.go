package models

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type WeightEntry struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	DailyLogID uint      `json:"dailyLogID"`
	Time       time.Time `json:"time"`
	Weight     uint      `json:"weight"`
}

func GetWeightEntries(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var items []WeightEntry
		db.Find(&items)
		if len(items) == 0 {
			w.WriteHeader(http.StatusNoContent)
		} else {
			json.NewEncoder(w).Encode(items)
		}
	}
}

func GetWeightEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item WeightEntry
		db.First(&item, params["id"])
		fmt.Println(item.Weight)
		json.NewEncoder(w).Encode(item)
	}
}

func CreateWeightEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("create weight entry from request: ", r.Body)
		var item WeightEntry
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("Weight: ", item)
		db.Create(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateWeightEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item WeightEntry
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteWeightEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item WeightEntry
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
