package models

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type FoodEntry struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	DailyLogID uint `json:"dailyLogID"`
	FoodItemID uint `json:"foodItemID"`
	QTY        uint `json:"qty"`
}

func GetFoodEntries(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var items []FoodEntry
		db.Find(&items)
		fmt.Println(items[0].FoodItemID)
		json.NewEncoder(w).Encode(items)
	}
}

func GetFoodEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item FoodEntry
		db.First(&item, params["id"])
		fmt.Println(item.FoodItemID)
		json.NewEncoder(w).Encode(item)
	}
}

func CreateFoodEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createFoodItem from request: ", r.Body)
		var item FoodEntry
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("Food Item: ", item)
		db.Create(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateFoodEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item FoodEntry
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteFoodEntry(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item FoodEntry
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
