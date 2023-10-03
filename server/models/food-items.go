package models

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type FoodItem struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	Name            string `json:"name"`
	Unit            string `json:"unit"`
	CaloriesPerUnit uint   `json:"caloriesPerUnit"`
}

func GetFoodItems(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var items []FoodItem
		db.Find(&items)
		json.NewEncoder(w).Encode(items)
	}
}

func GetFoodItem(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item FoodItem
		db.First(&item, params["id"])
		json.NewEncoder(w).Encode(item)
	}
}

func CreateFoodItem(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createFoodItem:")
		var item FoodItem
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("FoodItem: ", item)
		db.Create(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateFoodItem(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item FoodItem
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteFoodItem(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item FoodItem
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
