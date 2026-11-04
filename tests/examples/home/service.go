package main

type Service struct{ items map[int]Product }

func NewService() *Service {
	return &Service{items: map[int]Product{1: {ID: 1, Name: "pen"}}}
}

func (s *Service) Find(id int) (Product, bool) {
	p, ok := s.items[id]
	return p, ok
}
