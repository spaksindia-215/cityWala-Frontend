import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react'
import API from '../api/axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '../context/ToastContext';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const TIER_ICONS = {
  Diamond: 'fa-gem',
  Ruby: 'fa-crown',
  Emerald: 'fa-star',
};

export default function Plan() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [profile, setProfile] = useState(null);

  const handlePayment = async (plan, gateway) => {
    try {
      const { data } = await API.post(
        "/plans/create-order",
        {
          planId: plan._id,
          gateway,
          partnerId: profile?._id,
          email: profile?.email,
          phone: profile?.mobile,
          name: profile?.name,
          country: profile?.country_id,
          state: profile?.state_id,
          city: profile?.city_id,
        }
      );

      if (gateway === "paypal") {
        window.location.href = data.approvalUrl;
        return;
      }

      if (gateway === "razorpay") {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: plan.name,
          description: `${plan.duration} Month Plan`,

          handler: async function (response) {
            const verify = await API.post("/plans/verify-payment", {
              ...response,
              partnerId: profile._id,
              planId: plan._id,
              amount: plan.price
            })

            if (verify.data.success) {
              showToast("Payment Successful", "success");
              await getPlans();
            }
          }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  const getPlans = async () => {
    try {
      const profileRes = await API.get('/partner/profile');
      const partner = profileRes.data;
      setProfile(partner);

      const categoryId = partner?.category_id?._id || partner?.category_id;
      const subCategoryId = partner?.subcategory_id?._id || partner?.subcategory_id;
      const subSubCategoryId = partner?.sub_subcategory_id?._id || partner?.sub_subcategory_id;

      let query = '';

      if (subSubCategoryId) {
        query = `sub_subCategory_id=${subSubCategoryId}`;
      } else if (subCategoryId) {
        query = `subCategory_id=${subCategoryId}`;
      } else if (categoryId) {
        query = `category_id=${categoryId}`;
      } else {
        setPlans([]);
        return;
      }

      const plansRes = await API.get(`/plans?${query}`);
      setPlans(plansRes.data.plans || []);
    } catch (error) {
      console.error('Plan fetch error:', error.response?.data || error.message || error);
      setPlans([]);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

  return (
    <div>
      <section className="cw-page-header">
        <div className="container">
          <h1 className="cw-display cw-display--section text-white mb-0">
            {t('plans.choose_plan', { defaultValue: 'Choose your plan' })}
          </h1>
        </div>
      </section>

      <div className="container cw-section" style={{ paddingTop: "var(--cw-s6)", paddingBottom: "var(--cw-s6)" }}>
        <div className="row g-4 justify-content-center">
          <PayPalScriptProvider
            options={{ clientId: PAYPAL_CLIENT_ID || 'loading', currency: "USD" }}
          >
            {plans.map((plan, index) => {
              const isPopular = index === 1;
              return (
                <div key={plan._id || index} className="col-xl-3 col-lg-4 col-md-6">
                  <div className={`cw-card cw-card--feature cw-plan-card${isPopular ? " cw-plan-card--popular" : ""}`}>

                    {isPopular && (
                      <span className="cw-plan-card__badge">
                        <i className="fa-solid fa-star me-1" aria-hidden="true"></i>
                        {t("plans.most_popular")}
                      </span>
                    )}

                    <span className="cw-plan-card__icon">
                      <i className={`fa-solid ${TIER_ICONS[plan.name] || 'fa-gem'}`} aria-hidden="true"></i>
                    </span>

                    <h3 className="h4 fw-bold mb-3">{plan.name}</h3>

                    <div className="mb-4">
                      <span className="cw-plan-card__price">
                        {plan.price === 0
                          ? "Free"
                          : `${plan.currency === "USD" ? "$" : "₹"}${plan.price}`}
                      </span>
                      <div className="text-body-secondary" style={{ fontSize: 14 }}>
                        /{" "}
                        {plan.duration === 12
                          ? `1 ${t("plans.year")}`
                          : `${plan.duration} ${t("plans.month")}`}
                      </div>
                    </div>

                    <hr />

                    <ul className="list-unstyled mt-4 mb-5">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="d-flex align-items-start mb-3" style={{ fontSize: 15 }}>
                          <i className="fa-solid fa-circle-check me-2 mt-1" style={{ color: "var(--cw-blue-600)" }} aria-hidden="true"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="nav-btn primary w-100"
                      style={{ height: 48 }}
                      onClick={() => handlePayment(plan, "razorpay")}
                    >
                      {t("plans.pay_with_razorpay")}
                    </button>

                    {PAYPAL_CLIENT_ID && (
                      <div className="mt-2 cw-paypal-wrap">
                        <PayPalButtons
                          style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                          createOrder={async () => {
                            const res = await API.post("/plans/create-order", {
                              planId: plan._id,
                              gateway: "paypal",
                              partnerId: profile?._id,
                              email: profile?.email,
                              phone: profile?.mobile,
                              name: profile?.name,
                              country: profile?.country_id,
                              state: profile?.state_id,
                              city: profile?.city_id,
                            });
                            return res.data.order.id;
                          }}

                          onApprove={async (data) => {
                            try {
                              const captureRes = await API.post("/plans/paypal/capture-order", {
                                orderId: data.orderID,
                                planId: plan._id,
                                partnerId: profile?._id,
                              });

                              if (captureRes.data.success) {
                                showToast("PayPal payment successful", "success");
                                await getPlans();
                              } else {
                                showToast("PayPal payment failed: " + captureRes.data.message, "danger");
                              }
                            } catch (err) {
                              console.error("PayPal capture error", err);
                              showToast("PayPal payment failed. Check console.", "danger");
                            }
                          }}
                          onError={(err) => {
                            console.error("PayPal error", err);
                            showToast("PayPal checkout error. Try again.", "danger");
                          }}
                          onCancel={() => {
                            showToast("PayPal payment canceled", "warning");
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  )
}
