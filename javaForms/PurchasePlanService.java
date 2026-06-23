public class PurchasePlanService {

    private List<PurchasePlanForm> purchases = new ArrayList<>();

    public void addPurchase(PurchasePlanForm p) {
        purchases.add(p);
    }

    public List<PurchasePlanForm> getAll() {
        return purchases;
    }

    public void markDone(int item) {
        purchases.get(item).setDone(true);
    }
}
