using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using Microsoft.Kinect;
using Microsoft.Kinect.Toolkit.Interaction;
using Microsoft.Kinect.Toolkit.Controls;
using Microsoft.Kinect.Toolkit;


namespace Kinect.Server
{
    public class NewInteractionClient : IInteractionClient
    {
        public InteractionInfo GetInteractionInfoAtLocation(int skeletonTrackingId, InteractionHandType handType, double x, double y)
        {
            var result = new InteractionInfo();
            result.IsGripTarget = true;
            result.IsPressTarget = true;
            result.PressAttractionPointX = 0.5;
            result.PressAttractionPointY = 0.5;
            result.PressTargetControlId = 1;



            return result;
        }
    }

    class Program
    {
        static List<IWebSocketConnection> _clients = new List<IWebSocketConnection>();

        static Skeleton[] _skeletons = new Skeleton[6];

        static Mode _mode = Mode.Color;

        static CoordinateMapper _coordinateMapper;

        static UserInfo[] userInfos = new UserInfo[6];

        static InteractionStream _interactionStream;
        static KinectSensor _sensor;

        static void Main(string[] args)
        {
            InitializeConnection();
            InitilizeKinect();

            Console.ReadLine();
        }

        static void InitializeConnection()
        {
            var server = new WebSocketServer("ws://localhost:8181");

            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    _clients.Add(socket);
                };

                socket.OnClose = () =>
                {
                    _clients.Remove(socket);
                };
            });
        }

        static void InitilizeKinect()
        {
            _sensor = KinectSensor.KinectSensors.SingleOrDefault();


            if (_sensor != null)
            {
                _sensor.DepthStream.Enable(DepthImageFormat.Resolution640x480Fps30);

                _sensor.SkeletonStream.EnableTrackingInNearRange = true;
                _sensor.SkeletonStream.Enable();
                _coordinateMapper = _sensor.CoordinateMapper;
                _interactionStream = new InteractionStream(_sensor, new NewInteractionClient());
                _interactionStream.InteractionFrameReady += OnInteractionFrameReady;

                _sensor.DepthFrameReady += SensorOnDepthFrameReady;
                _sensor.SkeletonFrameReady += SensorOnSkeletonFrameReady;

                _sensor.Start();
            }
        }
        static void SensorOnDepthFrameReady(object sender, DepthImageFrameReadyEventArgs depthImageFrameReadyEventArgs)
        {
            using (DepthImageFrame depthFrame = depthImageFrameReadyEventArgs.OpenDepthImageFrame())
            {
                if (depthFrame == null)
                    return;

                try
                {
                    _interactionStream.ProcessDepth(depthFrame.GetRawPixelData(), depthFrame.Timestamp);
                }
                catch (InvalidOperationException)
                {
                }
            }
        }
        static void SensorOnSkeletonFrameReady(object sender, SkeletonFrameReadyEventArgs skeletonFrameReadyEventArgs)
        {
            using (SkeletonFrame skeletonFrame = skeletonFrameReadyEventArgs.OpenSkeletonFrame())
            {
                if (skeletonFrame == null)
                    return;

                try
                {
                    skeletonFrame.CopySkeletonDataTo(_skeletons);
                    var accelerometerReading = _sensor.AccelerometerGetCurrentReading();
                    _interactionStream.ProcessSkeleton(_skeletons, accelerometerReading, skeletonFrame.Timestamp);
                }
                catch (InvalidOperationException)
                {
                }

                var users = _skeletons.Where(s => s.TrackingState == SkeletonTrackingState.Tracked).ToList();

                if (users.Count > 0)
                {

                    string json = users.Serialize(_coordinateMapper, _mode);

                    foreach (var socket in _clients)
                    {
                        socket.Send(json);
                    }
                }
            }
        }

        static void OnInteractionFrameReady(object sender, InteractionFrameReadyEventArgs e)
        {
            using (InteractionFrame frame = e.OpenInteractionFrame())
            {
                if (frame != null)
                {
                    frame.CopyInteractionDataTo(userInfos);

                    foreach (UserInfo userInfo in userInfos)
                    {
                        foreach (InteractionHandPointer handPointer in userInfo.HandPointers)
                        {

                            string action = null;

                            switch (handPointer.HandEventType)
                            {
                                case InteractionHandEventType.Grip:
                                    action = "gripped";
                                    break;

                                case InteractionHandEventType.GripRelease:
                                    action = "released";
                                    break;
                            }

                            if (action != null)
                            {
                                string handSide = "unknown";

                                switch (handPointer.HandType)
                                {
                                    case InteractionHandType.Left:
                                        handSide = "left";
                                        break;

                                    case InteractionHandType.Right:
                                        handSide = "right";
                                        break;
                                }

                                Console.WriteLine("{\"hand\":" + handSide + ",\"action\":" + action + "}");
                                foreach (var socket in _clients)
                                {
                                    socket.Send("{\"hand\":\"" + handSide + "\",\"action\":\"" + action + "\"}");
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
