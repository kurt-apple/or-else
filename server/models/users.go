package models

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type User struct {
	ID                      uint      `gorm:"primaryKey" json:"id"`
	Name                    string    `json:"name"`
	CompletionRateThreshold float32   `json:"completionRateThreshold"`
	StartingSampleRate      uint      `json:"startingSampleRate"`
	TimeZoneOffset          int       `json:"timeZoneOffset"`
	StartingRation          uint      `json:"startingRation"`
	CreatedAt               time.Time `json:"createdAt"`
	MinRation               uint      `json:"minRation"`
	MinWeight               uint      `json:"minWeight"`
	StartingWeight          uint      `json:"startingWeight"`
}

func GetUsers(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("getUsers")
		var items []User
		db.Find(&items)
		fmt.Println(items)
		if len(items) == 0 {
			w.WriteHeader(http.StatusNoContent)
		} else {
			json.NewEncoder(w).Encode(items)
		}
	}
}

func GetUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item User
		db.First(&item, params["id"])
		json.NewEncoder(w).Encode(item)
	}
}

func MakeUser(db *gorm.DB, user *User) {
	fmt.Println("makeUser", user)
	db.Create(user)
	// firstDailyLog := &DailyLog{
	// 	UserID:     user.ID,
	// 	LogDate:    user.CreatedAt,
	// 	BaseRation: user.StartingRation,
	// }
	// db.Create(firstDailyLog)
	// fmt.Println("also made the first daily log: ", firstDailyLog)
}

func CreateUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("createuser:")
		var item User
		json.NewDecoder(r.Body).Decode(&item)
		fmt.Println("User: ", item)
		MakeUser(db, &item)
		json.NewEncoder(w).Encode(item)
	}
}

func UpdateUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item User
		db.First(&item, params["id"])
		json.NewDecoder(r.Body).Decode(&item)
		db.Save(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func DeleteUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var item User
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
