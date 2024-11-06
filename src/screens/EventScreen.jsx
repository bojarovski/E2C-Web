import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button, Form} from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'; 
import { useGetEventDetailsQuery, useCreateReviewMutation } from '../slices/eventsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useState } from 'react';
import { addToCart } from '../slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import {toast } from 'react-toastify'
import Meta from '../components/Meta';


const EventScreen = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { id: eventId } = useParams();

    const [quantity, setQuantity] = useState(1);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const {data: event, isLoading, refetch,  error} = useGetEventDetailsQuery(eventId);

    const { userInfo } = useSelector((state) => state.auth);

    const [createReview, {isLoading: loadingEventReviews}] = useCreateReviewMutation();

    const addToCartHandler = () => {
        dispatch(addToCart({ ...event, quantity}));
        navigate('/cart');
    }

  
    const submitHandler = async (e) => {
        e.preventDefault();
    
        try {
          await createReview({
            eventId,
            rating,
            comment,
          }).unwrap();
          refetch();
          toast.success('Review created successfully');
        } catch (err) {
          toast.error(err?.data?.message || err.error);
        }
      };



    // const [event, setEvent] = useState({});

    // useEffect(() => {
    //     const fetchEvent = async () =>{
    //         const { data } = await axios.get(`/api/events/${eventId}`);
    //         setEvent(data);
    //     }

    //     fetchEvent();
    // }, [eventId])


    return (
        <>
         <Link className='btn btn-light my-3' to='/'>
                Go Back
            </Link>
        {isLoading? (<Loader />) : error ? (<Message variant="danger">{error?.data?.message || error.error}</Message>) : (
            <>
            <Meta title={event.name} />
            <Row className="mb-4">
                <Col md={5}>
                    <Image
                        src={event.image} 
                        alt={event.name}
                        fluid
                    />
                </Col>
                <Col md={4}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h3>{event.name}</h3>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating value={event.rating} text={`${event.numberOfReviews} reviews`} />
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Price:</strong> €{event.price}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Description:</strong> {event.description}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row className="align-items-center">
                                <Col xs="auto">
                                    <FaCalendarAlt className="mr-2" /> 
                                </Col>
                                <Col>
                                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row className="align-items-center">
                                <Col xs="auto">
                                    <FaMapMarkerAlt className="mr-2" /> 
                                </Col>
                                <Col>
                                    <strong>Location:</strong> {event.location}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                    
                                <span>
                                    <strong>Type:</strong> {event.type}
                                </span>
                          
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <Row>
                                    <Col>Price:</Col>
                                    <Col>
                                        <strong>€{event.price}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Status:</Col>
                                    <Col>
                                        <strong>{event.countInStock > 0 ? "In Stock" : "Out of Stock"}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            {event.countInStock > 0 && (
                                <ListGroup.Item>
                                    <Row>
                                        <Col>
                                            Quantity:
                                        </Col>
                                        <Col>
                                            <Form.Control as="select" value={quantity} onChange={(e) => setQuantity(Number(e.target.value)) }>
                                                {[...Array(event.countInStock).keys()].map((x) => (
                                                    <option key={x + 1} value={ x + 1}>
                                                        { x + 1}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            )}
                            <ListGroup.Item>
                                <Button
                                    className="btn-block"
                                    type="button"
                                    disabled={event.countInStock === 0}
                                    onClick={addToCartHandler}
                                >
                                    Add To Cart
                                </Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
            <Row className='review'>
            <Col md={6}>
              <h2>Reviews</h2>
              {event.reviews.length === 0 && <Message>No Reviews</Message>}
              <ListGroup variant='flush'>
                {event.reviews.map((review) => (
                  <ListGroup.Item key={review._id}>
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <h2>Write a Customer Review</h2>

                  {loadingEventReviews && <Loader />}

                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group className='my-2' controlId='rating'>
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          as='select'
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value=''>Select...</option>
                          <option value='1'>1 - Poor</option>
                          <option value='2'>2 - Fair</option>
                          <option value='3'>3 - Good</option>
                          <option value='4'>4 - Very Good</option>
                          <option value='5'>5 - Excellent</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className='my-2' controlId='comment'>
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as='textarea'
                          row='3'
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                      <Button
                        disabled={loadingEventReviews}
                        type='submit'
                        variant='primary'
                      >
                        Submit
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Please <Link to='/login'>sign in</Link> to write a review
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
    )}
       
    
    </>

       
    );
};

export default EventScreen;