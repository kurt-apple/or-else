package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

type Habit struct {
	ID uint `gorm:"primaryKey" json:"id"`
	Title string `json:"title"`
	TimesSampled uint8 `json:"times_sampled"`
	TimesCompleted uint8 `json:"times_completed"`
}

func main() {
	db, err = gorm.Open(sqlite.Open("habits.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		sqlDB, _ := db.DB()
		_ = sqlDB.Close()
	}()
	
	db.AutoMigrate(&Habit{})
	
	router := mux.NewRouter()
	
	router.HandleFunc("/habits", getItems).Methods("GET")
	router.HandleFunc("/habits/{id}", getItem).Methods("GET")
	router.HandleFunc("/habits", createItem).Methods("POST")
	router.HandleFunc("/habits/{id}", updateItem).Methods("PUT")
	router.HandleFunc("/habits/{id}", deleteItem).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:9000"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func getItems(w http.ResponseWriter, r *http.Request) {
	fmt.Println("getItems")
	var items []Habit
	db.Find(&items)
	json.NewEncoder(w).Encode(items)
}

func getItem(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var item Habit
	db.First(&item, params["id"])
	json.NewEncoder(w).Encode(item)
}

func createItem(w http.ResponseWriter, r *http.Request) {
	fmt.Println("createItem:")
	var item Habit
	json.NewDecoder(r.Body).Decode(&item)
	fmt.Println("habit: ", item)
	db.Create(&item)
	json.NewEncoder(w).Encode(item)
}

func updateItem(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var item Habit
	db.First(&item, params["id"])
	json.NewDecoder(r.Body).Decode(&item)
	db.Save(&item)
	json.NewEncoder(w).Encode(item)
}

func deleteItem(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var item Habit
	db.First(&item, params["id"])
	db.Delete(&item)
	json.NewEncoder(w).Encode("Item Deleted")
}

