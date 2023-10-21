package models

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CompletionStatus uint

const (
	Completed    CompletionStatus = 2
	NotCompleted CompletionStatus = 1
	Unspecified  CompletionStatus = 0
)

type HabitSampleType uint

const (
	TopPerformer HabitSampleType = 2
	NeedsWork    HabitSampleType = 1
	NotSampled   HabitSampleType = 0
)

type Completion struct {
	///TODO: figure out best data type for date property
	ID                   uint             `gorm:"primaryKey" json:"id"`
	HabitID              uint             `json:"habitID"`
	DailyLogID           uint             `json:"dailyLogID"`
	CompletionRateOnDate float32          `json:"completionRateOnDate"`
	Status               CompletionStatus `json:"status"`
	SampleType           HabitSampleType  `json:"sampleType"`
}

func GetCompletions(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("getCompletions")
		var items []Completion
		db.Find(&items)
		if len(items) == 0 {
			w.WriteHeader(http.StatusNoContent)
		} else {
			json.NewEncoder(w).Encode(items)
		}
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

func UpdateCompletions(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// Parse the request body into an array of items.
		var updatedItems []Completion
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&updatedItems); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Invalid request body"))
			return
		}

		// Iterate through the updated items and update them in the database.
		for _, updatedItem := range updatedItems {
			// Check if the item exists in the database by ID and update it.
			var existingItem Completion
			if err := db.Where("id = ?", updatedItem.ID).First(&existingItem).Error; err != nil {
				w.WriteHeader(http.StatusNotFound)
				w.Write([]byte("Item not found"))
				return
			}

			// Update the item with the new values.
			db.Model(&existingItem).Updates(updatedItem)
		}

		w.WriteHeader(http.StatusOK)
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
