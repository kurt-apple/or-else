package main

import (
	"log"
	"net/http"
	"or-else/models"
	"or-else/seeds"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

func main() {
	db, err = gorm.Open(sqlite.Open("habits.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		sqlDB, _ := db.DB()
		_ = sqlDB.Close()
	}()

	listOfModels := []interface{}{&models.Habit{}, &models.User{}, &models.DailyLog{}, &models.Completion{}, &models.FoodEntry{}, &models.FoodItem{}, &models.WeightEntry{}}
	seeds.SeedDatabase(db, listOfModels)
	seeds.PrivateSeedDatabase(db, listOfModels) // expects a private seed file in the seeds package

	router := mux.NewRouter()

	router.HandleFunc("/habits", models.GetHabits(db)).Methods("GET")
	router.HandleFunc("/habits/{id}", models.GetHabit(db)).Methods("GET")
	router.HandleFunc("/habits", models.CreateHabit(db)).Methods("POST")
	router.HandleFunc("/habits/{id}", models.UpdateHabit(db)).Methods("PATCH")
	router.HandleFunc("/habits/{id}", models.DeleteHabit(db)).Methods("DELETE")

	router.HandleFunc("/users", models.GetUsers(db)).Methods("GET")
	router.HandleFunc("/users/{id}", models.GetUser(db)).Methods("GET")
	router.HandleFunc("/users", models.CreateUser(db)).Methods("POST")
	router.HandleFunc("/users/{id}", models.UpdateUser(db)).Methods("PATCH")
	router.HandleFunc("/users/{id}", models.DeleteUser(db)).Methods("DELETE")

	router.HandleFunc("/daily-logs", models.GetDailyLogs(db)).Methods("GET")
	router.HandleFunc("/daily-logs/{id}", models.GetDailyLog(db)).Methods("GET")
	router.HandleFunc("/daily-logs", models.CreateDailyLog(db)).Methods("POST")
	router.HandleFunc("/daily-logs/{id}", models.UpdateDailyLog(db)).Methods("PATCH")
	router.HandleFunc("/daily-logs/{id}", models.DeleteDailyLog(db)).Methods("DELETE")

	router.HandleFunc("/completions", models.GetCompletions(db)).Methods("GET")
	router.HandleFunc("/completions/{id}", models.GetCompletion(db)).Methods("GET")
	router.HandleFunc("/completions", models.CreateCompletion(db)).Methods("POST")
	router.HandleFunc("/completions/{id}", models.UpdateCompletion(db)).Methods("PATCH")
	router.HandleFunc("/completions/batch-update", models.UpdateCompletions(db)).Methods("POST")
	router.HandleFunc("/completions/{id}", models.DeleteCompletion(db)).Methods("DELETE")

	router.HandleFunc("/food-entries", models.GetFoodEntries(db)).Methods("GET")
	router.HandleFunc("/food-entries/{id}", models.GetFoodEntry(db)).Methods("GET")
	router.HandleFunc("/food-entries", models.CreateFoodEntry(db)).Methods("POST")
	router.HandleFunc("/food-entries/{id}", models.UpdateFoodEntry(db)).Methods("PATCH")
	router.HandleFunc("/food-entries/{id}", models.DeleteFoodEntry(db)).Methods("DELETE")

	router.HandleFunc("/food-items", models.GetFoodItems(db)).Methods("GET")
	router.HandleFunc("/food-items/{id}", models.GetFoodItem(db)).Methods("GET")
	router.HandleFunc("/food-items", models.CreateFoodItem(db)).Methods("POST")
	router.HandleFunc("/food-items/{id}", models.UpdateFoodItem(db)).Methods("PATCH")
	router.HandleFunc("/food-items/{id}", models.DeleteFoodItem(db)).Methods("DELETE")

	router.HandleFunc("/weight-entries", models.GetWeightEntries(db)).Methods("GET")
	router.HandleFunc("/weight-entries/{id}", models.GetWeightEntry(db)).Methods("GET")
	router.HandleFunc("/weight-entries", models.CreateWeightEntry(db)).Methods("POST")
	router.HandleFunc("/weight-entries/{id}", models.UpdateWeightEntry(db)).Methods("PATCH")
	router.HandleFunc("/weight-entries/{id}", models.DeleteWeightEntry(db)).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:9000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
	})

	handler := c.Handler(router)
	log.Fatal(http.ListenAndServe(":8080", handler))
}
