import java.time.LocalDate;
import java.util.UUID;
public class PurchasePlanForm {
    private String id;
    private String purchaseTitle;
    private double purchaseAmt;
    private String purchaseCategory;
    private LocalDate planDate;
    private boolean isPurchased;

    public PurchasePlanForm(String purchaseTitle, double purchaseAmt, String purchaseCategory, LocalDate planDate) {
        this.id = UUID.randomUUID().toString();
        this.purchaseTitle = title;
        this.purchaseAmt = amount;
        this.purchaseCategory = category;
        this.planDate = purchaseDate;
        this.isPurchased = false;
    }

}
 