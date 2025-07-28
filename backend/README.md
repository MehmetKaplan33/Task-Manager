# Task Manager Backend

Bu proje, modern teknolojiler kullanılarak geliştirilmiş bir görev yönetimi uygulamasının backend kısmıdır.

## 🚀 Teknolojiler

- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL
- Maven
- JWT Authentication
- Lombok
- ModelMapper
- Swagger/OpenAPI

## 🛠️ Kurulum

Projeyi yerel makinenizde çalıştırmak için:

```bash
# Projeyi klonlayın
git clone [repository-url]

# Proje dizinine gidin
cd task-manager/backend

# Projeyi derleyin
mvn clean install

# Uygulamayı başlatın
mvn spring-boot:run
```

## 📋 Özellikler

- RESTful API Endpoints
- JWT Tabanlı Kimlik Doğrulama
- Kullanıcı Yönetimi
- Görev Yönetimi
- Rol Tabanlı Yetkilendirme
- Hata Yönetimi
- API Dokümantasyonu (Swagger)

## 🔧 API Endpoints

### Kullanıcı İşlemleri
- `POST /api/v1/auth/register` - Yeni kullanıcı kaydı
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `GET /api/v1/users/profile` - Kullanıcı profili görüntüleme
- `PUT /api/v1/users/profile` - Kullanıcı profili güncelleme

### Görev İşlemleri
- `GET /api/v1/tasks` - Görevleri listele
- `POST /api/v1/tasks` - Yeni görev oluştur
- `PUT /api/v1/tasks/{id}` - Görev güncelle
- `DELETE /api/v1/tasks/{id}` - Görev sil
- `GET /api/v1/tasks/{id}` - Görev detayı

## 📁 Proje Yapısı

```
src/
├── main/
│   ├── java/com/taskmanager/
│   │   ├── config/          # Konfigürasyon sınıfları
│   │   ├── controller/      # REST kontrolcüleri
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── exception/      # Özel istisna sınıfları
│   │   ├── model/          # Veri tabanı varlıkları
│   │   ├── repository/     # JPA repository'leri
│   │   ├── service/        # İş mantığı servisleri
│   │   └── security/       # Güvenlik konfigürasyonları
│   └── resources/
│       └── application.properties  # Uygulama ayarları
```

## 🔑 Ortam Değişkenleri

Uygulamayı çalıştırmadan önce aşağıdaki ortam değişkenlerini ayarlamanız gerekir:

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskmanager
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

## 🧪 Test

Testleri çalıştırmak için:

```bash
mvn test
```

## 📚 API Dokümantasyonu

API dokümantasyonuna uygulama çalışırken şu adresten erişebilirsiniz:
```
http://localhost:8080/swagger-ui.html
```

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun


