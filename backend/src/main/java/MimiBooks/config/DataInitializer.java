package MimiBooks.config;

import MimiBooks.model.Book;
import MimiBooks.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner loadBooks(BookRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                add(repository, "The Alchemist", "Paulo Coelho", 399, "Fiction", "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg");
                add(repository, "Atomic Habits", "James Clear", 499, "Self Help", "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg");
                add(repository, "Ikigai", "Hector Garcia", 299, "Self Help", "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg");
                add(repository, "The Psychology of Money", "Morgan Housel", 349, "Finance", "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg");
                add(repository, "Harry Potter", "J.K. Rowling", 599, "Fantasy", "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg");
                add(repository, "Rich Dad Poor Dad", "Robert Kiyosaki", 399, "Finance", "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg");
            }
        };
    }

    private void add(BookRepository repository, String title, String author,
                     double price, String category, String imageUrl) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setPrice(price);
        book.setCategory(category);
        book.setImageUrl(imageUrl);
        repository.save(book);
    }
}
