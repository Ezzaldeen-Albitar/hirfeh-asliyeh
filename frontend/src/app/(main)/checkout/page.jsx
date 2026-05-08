'use client';
import AuthGuard from '@/components/auth/AuthGuard';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Elements, CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { useConfirmPaymentIntentMutation, useCreatePaymentIntentMutation } from '@/store/api/paymentApi';
import { toast } from '@/lib/sweetalert';
import { DEFAULT_PRODUCT_IMAGE, getPrimaryImageSrc } from '@/lib/imageUtils';

const STEPS = ['السلة', 'الشحن', 'الدفع', 'التأكيد'];
const GOVS = ['عمان', 'الزرقاء', 'إربد', 'مأدبا', 'جرش', 'عجلون', 'البلقاء', 'الكرك', 'الطفيلة', 'معان', 'العقبة'];
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#2f2a26',
      fontFamily: 'inherit',
      '::placeholder': {
        color: '#9f8a79',
      },
    },
    invalid: {
      color: '#b42318',
    },
  },
};

const getErrorMessage = (err, fallback) =>
  err?.data?.errors?.[0] ||
  err?.data?.message ||
  err?.message ||
  fallback;

const resolvePaymentMethod = (payMethod) => {
  if (payMethod === 'cash') return 'cash_on_delivery';
  if (payMethod === 'card') return 'stripe';
  return 'cliq';
};

const buildOrderPayload = (items, shipping, payMethod) => ({
  items: items.map((item) => ({
    productId: item._id || item.id || item.product?._id || item.productId,
    quantity: item.qty || item.quantity || 1,
  })),
  shippingAddress: {
    recipientName: shipping.name,
    phone: shipping.phone,
    city: shipping.governorate,
    governorate: shipping.governorate,
    street: shipping.address,
    notes: shipping.notes,
  },
  paymentMethod: resolvePaymentMethod(payMethod),
  notes: shipping.notes,
});

function StripeCardFields({ cardholderName, setCardholderName, cardError }) {
  return (
    <div className="rounded-4 p-3 mb-3" style={{ border: '1px solid var(--gold-pale)', background: '#fffaf5' }}>
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3 flex-wrap">
        <div>
          <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>بيانات بطاقة Visa / Mastercard</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--warm-gray)' }}>
            لن يتم حفظ بيانات البطاقة على منصتنا، ويتم تمريرها مباشرة إلى Stripe.
          </div>
        </div>
        <div className="d-flex align-items-center gap-2" style={{ color: 'var(--warm-gray)', fontSize: '1.15rem' }}>
          <i className="bi bi-credit-card-2-front" />
          <i className="bi bi-shield-check" />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          اسم حامل البطاقة <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="كما هو مكتوب على البطاقة"
          style={{ borderRadius: 10, borderColor: 'var(--stone)' }}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          رقم البطاقة <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="form-control py-3" style={{ borderRadius: 10, borderColor: 'var(--stone)' }}>
          <CardNumberElement options={cardElementOptions} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            تاريخ الانتهاء <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="form-control py-3" style={{ borderRadius: 10, borderColor: 'var(--stone)' }}>
            <CardExpiryElement options={cardElementOptions} />
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            رمز الأمان CVC <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="form-control py-3" style={{ borderRadius: 10, borderColor: 'var(--stone)' }}>
            <CardCvcElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      {cardError && (
        <div className="mt-3 rounded-3 p-2" style={{ background: 'rgba(180,35,24,.08)', color: '#b42318', fontSize: '0.82rem' }}>
          {cardError}
        </div>
      )}
    </div>
  );
}

function StripeCheckoutActions({
  items,
  shipping,
  user,
  createOrder,
  clearCart,
  setOrderId,
  setStep,
  setCompletionMeta,
  onBack,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();
  const [confirmPaymentIntent, { isLoading: isConfirmingIntent }] = useConfirmPaymentIntentMutation();
  const [cardholderName, setCardholderName] = useState(shipping.name || user?.name || '');
  const [cardError, setCardError] = useState('');
  const [draftOrderId, setDraftOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isSubmitting || isCreatingIntent || isConfirmingIntent;

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error('لم تجهز بوابة الدفع بعد. أعد تحميل الصفحة ثم حاول مجدداً.');
      return;
    }
    if (!cardholderName.trim()) {
      toast.error('يرجى إدخال اسم حامل البطاقة.');
      return;
    }

    setIsSubmitting(true);
    setCardError('');

    try {
      let currentOrderId = draftOrderId;
      if (!currentOrderId) {
        const orderResponse = await createOrder(buildOrderPayload(items, shipping, 'card')).unwrap();
        currentOrderId = orderResponse?.order?._id || orderResponse?.data?._id || orderResponse?._id;
        if (!currentOrderId) {
          throw new Error('تعذر إنشاء طلب الدفع بالبطاقة.');
        }
        setDraftOrderId(currentOrderId);
      }

      const intentResponse = await createPaymentIntent({ orderId: currentOrderId }).unwrap();
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('تعذر تحميل حقول البطاقة. أعد تحميل الصفحة ثم حاول مجدداً.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(intentResponse.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardholderName.trim(),
            email: user?.email || undefined,
            phone: shipping.phone || undefined,
            address: {
              line1: shipping.address || undefined,
              city: shipping.governorate || undefined,
              state: shipping.governorate || undefined,
              country: 'JO',
            },
          },
        },
      });

      if (error) {
        setCardError(error.message || 'تعذر إتمام عملية الدفع.');
        throw new Error(error.message || 'تعذر إتمام عملية الدفع.');
      }

      if (!paymentIntent) {
        throw new Error('لم يصل تأكيد نهائي من بوابة الدفع.');
      }

      if (paymentIntent.status === 'processing') {
        clearCart();
        setOrderId(currentOrderId);
        setCompletionMeta({ paymentMethod: 'stripe', paymentStatus: paymentIntent.status });
        toast.success('تم إرسال عملية الدفع وهي قيد المعالجة. سيتم تحديث الطلب تلقائياً عند تأكيدها.');
        setStep(3);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`لم يكتمل الدفع بعد. الحالة الحالية: ${paymentIntent.status}`);
      }

      const verification = await confirmPaymentIntent({ orderId: currentOrderId }).unwrap();
      const confirmedOrderId = verification?.order?._id || currentOrderId;

      clearCart();
      setDraftOrderId(null);
      setOrderId(confirmedOrderId);
      setCompletionMeta({ paymentMethod: 'stripe', paymentStatus: 'paid' });
      toast.success('تم دفع بطاقتك وتأكيد الطلب بنجاح.');
      setStep(3);
    } catch (err) {
      toast.error(getErrorMessage(err, 'تعذر إتمام الدفع بالبطاقة، حاول مجدداً.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StripeCardFields
        cardholderName={cardholderName}
        setCardholderName={setCardholderName}
        cardError={cardError}
      />

      <div className="d-flex gap-3 justify-content-between">
        <button className="btn btn-outline-primary" style={{ borderRadius: 10 }} onClick={onBack} disabled={isBusy}>
          <i className="bi bi-arrow-right me-2" />
          رجوع
        </button>
        <button
          className="btn btn-primary px-5"
          style={{ borderRadius: 10, fontWeight: 700, fontSize: '0.95rem' }}
          disabled={isBusy}
          onClick={handleSubmit}
        >
          {isBusy ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              جاري تفويض الدفع...
            </>
          ) : (
            <>
              ادفع الآن <i className="bi bi-lock-fill ms-2" />
            </>
          )}
        </button>
      </div>
    </>
  );
}

function CheckoutPage() {
  const searchParams = useSearchParams();
  const { items, total, removeItem, updateQty, clearCart } = useCart();
  const { user } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [step, setStep] = useState(() => {
    const requestedStep = Number(searchParams.get('step') || 0);
    return Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep <= 3 ? requestedStep : 0;
  });
  const [orderId, setOrderId] = useState(null);
  const [completionMeta, setCompletionMeta] = useState({ paymentMethod: null, paymentStatus: null });
  const [shipping, setShipping] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    governorate: '',
    notes: '',
  });
  const [payMethod, setPayMethod] = useState('cash');

  const setShip = (key) => (e) => setShipping((current) => ({ ...current, [key]: e.target.value }));
  const isStripeConfigured = Boolean(stripePromise);

  const handleOrder = async () => {
    try {
      const result = await createOrder(buildOrderPayload(items, shipping, payMethod)).unwrap();
      clearCart();
      setOrderId(result?.order?._id || result?.data?._id || result?._id || 'N/A');
      setCompletionMeta({ paymentMethod: resolvePaymentMethod(payMethod), paymentStatus: 'pending' });
      toast.success('تم تقديم طلبك بنجاح!');
      setStep(3);
    } catch (err) {
      toast.error(getErrorMessage(err, 'تعذر إتمام الطلب، حاول مجدداً'));
    }
  };

  if (!items.length && step !== 3) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3" style={{ background: 'var(--cream)' }}>
        <i className="bi bi-bag-x fs-1" style={{ color: 'var(--stone)' }} />
        <h3 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>سلتك فارغة</h3>
        <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>أضف منتجات من متجرنا لإتمام الشراء</p>
        <Link href="/products" className="btn btn-primary" style={{ borderRadius: 10, fontWeight: 700 }}>
          تسوّق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ padding: '40px 12px 60px' }}>
        <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '2rem', color: 'var(--charcoal)', marginBottom: 32 }}>إتمام الشراء</h1>

        <div className="d-flex align-items-center mb-4 flex-wrap gap-1">
          {STEPS.map((label, index) => (
            <div key={label} className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  background: index < step ? 'var(--gold)' : index === step ? 'var(--burgundy)' : 'var(--parchment)',
                  color: index <= step ? '#fff' : 'var(--warm-gray)',
                  border: index > step ? '2px solid var(--stone)' : 'none',
                  transition: 'all .3s',
                }}
              >
                {index < step ? <i className="bi bi-check-lg" /> : index + 1}
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: index === step ? 700 : 400,
                  color: index === step ? 'var(--burgundy)' : 'var(--warm-gray)',
                  transition: 'all .3s',
                }}
              >
                {label}
              </span>
              {index < STEPS.length - 1 && <div style={{ width: 24, height: 2, background: 'var(--stone)', borderRadius: 2 }} />}
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            {step === 0 && (
              <div className="ha-card p-4">
                <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', marginBottom: 20 }}>مراجعة السلة</h5>
                {items.map((item) => (
                  <div key={item._id} className="d-flex align-items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--gold-pale)' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 'inherit', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Image
                        src={getPrimaryImageSrc(item.images, DEFAULT_PRODUCT_IMAGE)}
                        alt=""
                        fill
                        sizes="72px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--charcoal)' }} className="text-truncate">
                        {item.name}
                      </div>
                      {item.artisan?.name && <div style={{ color: 'var(--warm-gray)', fontSize: '0.78rem' }}>{item.artisan.name}</div>}
                    </div>
                    <div className="d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
                        style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--stone)', borderRadius: 6, fontSize: '1rem', lineHeight: 1 }}
                      >
                        −
                      </button>
                      <span style={{ width: 32, textAlign: 'center', fontWeight: 600, fontSize: '0.92rem' }}>{item.qty}</span>
                      <button
                        className="btn btn-sm"
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--stone)', borderRadius: 6, fontSize: '1rem', lineHeight: 1 }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, color: 'var(--burgundy)', minWidth: 65, textAlign: 'start', flexShrink: 0 }}>
                      {item.price * item.qty} <small style={{ fontWeight: 400, fontSize: '0.68rem', color: 'var(--warm-gray)' }}>د.أ</small>
                    </div>
                    <button
                      className="btn btn-sm"
                      onClick={() => removeItem(item._id)}
                      style={{ color: 'var(--warm-gray)', background: 'none', border: 'none', fontSize: '1.1rem', flexShrink: 0 }}
                    >
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                ))}
                <div className="mt-4 text-end">
                  <button className="btn btn-primary px-5 py-2" style={{ borderRadius: 10, fontWeight: 700 }} onClick={() => setStep(1)}>
                    متابعة إلى الشحن <i className="bi bi-arrow-left ms-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="ha-card p-4">
                <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', marginBottom: 20 }}>بيانات الشحن</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      الاسم الكامل <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input type="text" className="form-control" value={shipping.name} onChange={setShip('name')} required style={{ borderRadius: 8, borderColor: 'var(--stone)' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      رقم الهاتف <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ background: 'var(--parchment)', borderColor: 'var(--stone)', fontSize: '0.82rem' }}>
                        🇯🇴
                      </span>
                      <input type="tel" className="form-control" value={shipping.phone} onChange={setShip('phone')} required style={{ borderColor: 'var(--stone)' }} />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      العنوان التفصيلي <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="الشارع، الحي، رقم المبنى..."
                      value={shipping.address}
                      onChange={setShip('address')}
                      required
                      style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      المحافظة <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select className="form-select" value={shipping.governorate} onChange={setShip('governorate')} style={{ borderRadius: 8, borderColor: 'var(--stone)' }}>
                      <option value="">اختر...</option>
                      {GOVS.map((gov) => (
                        <option key={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>ملاحظات إضافية</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="أي تعليمات خاصة للتوصيل..."
                      value={shipping.notes}
                      onChange={setShip('notes')}
                      style={{ borderRadius: 8, borderColor: 'var(--stone)', resize: 'none' }}
                    />
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4 justify-content-between">
                  <button className="btn btn-outline-primary" style={{ borderRadius: 10 }} onClick={() => setStep(0)}>
                    <i className="bi bi-arrow-right me-2" />
                    رجوع
                  </button>
                  <button
                    className="btn btn-primary px-5"
                    style={{ borderRadius: 10, fontWeight: 700 }}
                    onClick={() => {
                      if (!shipping.name || !shipping.phone || !shipping.address || !shipping.governorate) {
                        toast.error('يرجى ملء جميع الحقول المطلوبة');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    متابعة إلى الدفع <i className="bi bi-arrow-left ms-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ha-card p-4">
                <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', marginBottom: 20 }}>طريقة الدفع</h5>
                {[
                  { key: 'cash', label: 'الدفع عند الاستلام', icon: 'bi-cash-stack', desc: 'ادفع نقداً عند وصول طلبك' },
                  { key: 'card', label: 'بطاقة ائتمانية', icon: 'bi-credit-card', desc: 'Visa / Mastercard عبر Stripe' },
                  { key: 'cliq', label: 'CliQ', icon: 'bi-phone-fill', desc: 'الدفع عبر خدمة CliQ الأردنية' },
                ].map((method) => (
                  <div
                    key={method.key}
                    onClick={() => setPayMethod(method.key)}
                    className="d-flex align-items-center gap-3 p-3 mb-3"
                    style={{
                      borderRadius: 12,
                      border: `2px solid ${payMethod === method.key ? 'var(--burgundy)' : 'var(--stone)'}`,
                      background: payMethod === method.key ? 'rgba(122,28,46,.04)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 10,
                        background: 'var(--parchment)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        color: 'var(--burgundy)',
                        flexShrink: 0,
                      }}
                    >
                      <i className={`bi ${method.icon}`} />
                    </div>
                    <div className="flex-grow-1">
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{method.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}>{method.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${payMethod === method.key ? 'var(--burgundy)' : 'var(--stone)'}`,
                        background: payMethod === method.key ? 'var(--burgundy)' : 'transparent',
                        transition: 'all .2s',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))}

                <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3" style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)' }}>
                  <i className="bi bi-shield-lock-fill" style={{ color: '#22c55e', fontSize: '1.1rem' }} />
                  <small style={{ color: '#166534' }}>
                    جميع معلوماتك محمية ومشفرة بالكامل
                    {payMethod === 'card' ? ' عبر Stripe' : ''}
                  </small>
                </div>

                {payMethod === 'card' && !isStripeConfigured && (
                  <div className="rounded-3 p-3 mb-3" style={{ background: 'rgba(180,35,24,.08)', color: '#b42318', border: '1px solid rgba(180,35,24,.15)' }}>
                    الدفع بالبطاقة غير مفعل بعد. أضف المفتاح `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` في ملف
                    `frontend/.env.local` مع تهيئة مفاتيح Stripe على الباكند.
                  </div>
                )}

                {payMethod === 'card' && isStripeConfigured ? (
                  <Elements stripe={stripePromise}>
                    <StripeCheckoutActions
                      items={items}
                      shipping={shipping}
                      user={user}
                      createOrder={createOrder}
                      clearCart={clearCart}
                      setOrderId={setOrderId}
                      setStep={setStep}
                      setCompletionMeta={setCompletionMeta}
                      onBack={() => setStep(1)}
                    />
                  </Elements>
                ) : (
                  <div className="d-flex gap-3 justify-content-between">
                    <button className="btn btn-outline-primary" style={{ borderRadius: 10 }} onClick={() => setStep(1)}>
                      <i className="bi bi-arrow-right me-2" />
                      رجوع
                    </button>
                    <button
                      className="btn btn-primary px-5"
                      style={{ borderRadius: 10, fontWeight: 700, fontSize: '0.95rem' }}
                      disabled={isLoading || (payMethod === 'card' && !isStripeConfigured)}
                      onClick={handleOrder}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          جاري التأكيد...
                        </>
                      ) : (
                        <>
                          تأكيد الطلب <i className="bi bi-check-circle ms-2" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="ha-card p-5 text-center">
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(34,197,94,.12)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#22c55e', fontSize: '3rem' }} />
                </div>
                <h3 style={{ fontFamily: 'Amiri,serif', fontSize: '2.2rem', color: 'var(--charcoal)', marginBottom: 8 }}>
                  {completionMeta.paymentMethod === 'stripe' && completionMeta.paymentStatus === 'paid'
                    ? 'تم دفع طلبك بنجاح!'
                    : completionMeta.paymentMethod === 'stripe'
                    ? 'تم استلام طلب الدفع'
                    : 'تم تقديم طلبك!'}
                </h3>
                {orderId && (
                  <div className="mb-3 p-3 rounded-3" style={{ background: 'var(--parchment)', border: '1px solid var(--gold-pale)', display: 'inline-block' }}>
                    <small style={{ color: 'var(--warm-gray)', fontSize: '0.8rem' }}>رقم طلبك</small>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--burgundy)', fontSize: '1rem' }}>
                      #HA-{orderId?.slice(-8)?.toUpperCase()}
                    </div>
                  </div>
                )}
                <p style={{ color: 'var(--warm-gray)', marginBottom: 28, maxWidth: 460, marginInline: 'auto' }}>
                  {completionMeta.paymentMethod === 'stripe' && completionMeta.paymentStatus === 'paid'
                    ? 'تم التحقق من بطاقتك وإرسال الطلب للحرفي مباشرة. يمكنك متابعة حالة الطلب من لوحة حسابك.'
                    : completionMeta.paymentMethod === 'stripe'
                    ? 'تم إرسال عملية الدفع إلى بوابة الدفع وهي قيد المعالجة الآن. تابع حالة الطلب من لوحة حسابك خلال دقائق.'
                    : 'سيتواصل معك الحرفي لتأكيد الطلب خلال 24 ساعة. يمكنك متابعة حالة طلبك من حسابك.'}
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link href="/dashboard" className="btn btn-primary px-4" style={{ borderRadius: 10, fontWeight: 700 }}>
                    <i className="bi bi-bag-check me-2" />
                    متابعة طلباتي
                  </Link>
                  <Link href="/products" className="btn btn-outline-primary px-4" style={{ borderRadius: 10, fontWeight: 700 }}>
                    <i className="bi bi-shop me-2" />
                    متابعة التسوق
                  </Link>
                </div>
              </div>
            )}
          </div>

          {step < 3 && (
            <div className="col-lg-4">
              <div className="ha-card p-4" style={{ position: 'sticky', top: 80 }}>
                <h6 style={{ fontFamily: 'Amiri,serif', fontSize: '1.15rem', marginBottom: 16, borderBottom: '1px solid var(--gold-pale)', paddingBottom: 12 }}>
                  ملخص الطلب
                </h6>
                {items.map((item) => (
                  <div key={item._id} className="d-flex justify-content-between align-items-start mb-3" style={{ fontSize: '0.85rem' }}>
                    <div className="d-flex gap-2 align-items-center" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'inherit', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        <Image src={getPrimaryImageSrc(item.images, DEFAULT_PRODUCT_IMAGE)} alt="" fill sizes="36px" style={{ objectFit: 'cover' }} />
                      </div>
                      <div className="min-width-0">
                        <div style={{ color: 'var(--charcoal)', fontWeight: 500, fontSize: '0.82rem' }} className="text-truncate">
                          {item.name}
                        </div>
                        <div style={{ color: 'var(--stone)', fontSize: '0.75rem' }}>× {item.qty}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, flexShrink: 0, marginRight: 8 }}>{item.price * item.qty} د.أ</span>
                  </div>
                ))}
                <hr style={{ borderColor: 'var(--gold-pale)' }} />
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>
                  <span>المجموع الفرعي</span>
                  <span>{total} د.أ</span>
                </div>
                <div className="d-flex justify-content-between mb-3" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--warm-gray)' }}>الشحن</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>مجاني</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: 'var(--parchment)', border: '1px solid var(--gold-pale)' }}>
                  <strong style={{ fontFamily: 'Amiri,serif', fontSize: '1.05rem' }}>الإجمالي</strong>
                  <strong style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: 'var(--burgundy)' }}>
                    {total} <small style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--warm-gray)' }}>د.أ</small>
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <CheckoutPage />
    </AuthGuard>
  );
}
